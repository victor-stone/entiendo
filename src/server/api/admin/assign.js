import {
  IdiomModel,
  ExampleModel,
  IdiomModelQuery,
  ExampleModelQuery,
  UserModel,
  SettingsModel,
} from "../../models/index.js";
import debug from "debug";
import { deleteAudioFromS3, uploadAudioToS3, renameAudioInS3 } from "../../lib/audio.js";
import { checkUrlExpiration } from "../lib/finalizeExample.js";
import { generateExampleAudioFilename } from "../exampleAPI.js";

const debugAss = debug("api:assign");

const MAGIC_WORD = 'assigned';

async function _incSyncCounter() {
  const counter = SettingsModel.get("SYNC_COUNTER");
  const model = new SettingsModel();
  await model.put("SYNC_COUNTER", counter + 1);
  return counter;
}

/*
  ((((((((((()))))))))))
    MANAGE ASSIGNMENTS
  ((((((((((()))))))))))
*/

export async function editors() {
  const model = new UserModel();
  const all = await model.findAll();
  const editors = all.reduce( (arr, u) => {
    if(u.role == 'editor' || u.role == 'admin') {
      debugAss('Found editor: ' + u.editor)
      arr.push(u.editor);
    } 
    return arr;
  }, []);
  return editors.filter( e => !!e );
}

export async function assignEditorToIdiom(routeContext) {
  // TODO: this is too much semantics packed into the 'source'
  const { idiomId, source } = routeContext.payload;
  const model = new IdiomModel();
  return _doAssign({ model, idiomId, source }, source == '-unassign' );
}

async function _doAssign({ model, idiomId, ...remains }, erase = false) {
  const rec = await model.getById(idiomId);
  debugAss(
    "doing %s %s %s",
    erase ? "erase" : "assign",
    remains.source || remains.audio.voice || "",
    rec.text
  );
  let assigned;
  if (erase) {
    assigned = {};
  } else {
    if (Object.hasOwn(rec, "assigned")) {
      assigned = rec.assigned;
      Object.keys(remains).forEach((k) => {
        if (remains[k]) {
          assigned[k] = remains[k];
        }
      });
    } else {
      assigned = {
        date: Date.now(),
        ...remains,
      };
      if( !assigned.sync ) {
          assigned.sync = await _incSyncCounter();
      }
    }
  }
  return model.update(idiomId, { assigned });
}

export async function assignPublish(routeContext) {
  const { idiomId, assign } = routeContext.payload;
  let model = new ExampleModel();
  const rec = await model.createExample(
    idiomId,
    assign.transcription,
    assign.conjugatedSnippet,
    assign.source,
    assign.audio);

  // Check if audio filename starts with 'assigned_' and rename if needed
  if (rec.audio && rec.audio.publicUrl && rec.audio.publicUrl.includes( MAGIC_WORD + '_')) {
    const newFilename = generateExampleAudioFilename(rec);
    const audio = await renameAudioInS3(rec.audio.publicUrl, newFilename);
    model.addAudio(rec.exampleId, { ...assign.audio, ...audio });
  }

  const idiomModel = new IdiomModel();
  debugAss('Published example for %s', rec.text);
  return _doAssign({ model: idiomModel, idiomId: rec.idiomId }, true);
}

/*
  ((((((((((()))))))))))
    GENERATE REPORTS
  ((((((((((()))))))))))
*/

export async function assignmentReports(routeContext) {
  const { reportName } = routeContext.payload;
  const AUDIO_REPORTS = {
    ASSIGNABLE_IDIOMS: _getAssignableIdioms,
    ASSIGNED_IDIOMS: _getAssignedIdioms,
  };
  
  const idioms = await AUDIO_REPORTS[reportName](routeContext.payload);

  await checkAudioUrl();

  return idioms;

  /* ensure and save browser audio url */
  
  async function checkAudioUrl() {
    const model = new IdiomModel();

    for (var i = 0; i < idioms.length; i++) {
      const idiom = idioms[i];
      if (idiom?.assigned?.audio?.publicUrl) {
        const url = idiom.assigned?.audio?.url;
        idiom.assigned.audio = await checkUrlExpiration(idiom.assigned.audio);
        const needUpdate = url !== idiom.assigned?.audio?.url;
        if (needUpdate) {
          const assigned = { ...idiom.assigned };
          await model.update(idiom.idiomId, { assigned });
        }
      }
    }
  }
}

async function _getAssignedIdioms({ editor }) {
  const idiomQuery = await IdiomModelQuery.create();
  return idiomQuery.assigned(editor);
}

async function _getAssignableIdioms() {
  const idiomQuery = await IdiomModelQuery.create();
  const exampleQuery = await ExampleModelQuery.create();

  const idioms = idiomQuery.idioms();

  return idioms.filter(({ idiomId, assigned }) => {
    if( assigned ) {
      return true;
    }
    const examples = exampleQuery.forIdiom(idiomId);
    return !examples || !examples.length;
  });
}

/*
  ((((((((((()))))))))))
      MANAGE FILES
  ((((((((((()))))))))))
*/

export async function deleteAudioForExample(exampleId) {
  const query   = ExampleModelQuery.create();
  const example = query.example(exampleId);
  await deleteAudioFromS3(example.audio.publicUrl);
  const model = new ExampleModel();
  return await model.update(exampleId, { audio: {} });
}

export async function replaceAudioInExample({ exampleId, audio }) {
  await deleteAudio(exampleId, audio.source);
  await attachAudioToExample({ exampleId, audio });
}

function _extractSnippet({ transcription, conjugatedSnippet }) {
  if (!conjugatedSnippet) {
    const match = transcription.match(/\*(.*?)\*/);
    if (match) {
      conjugatedSnippet = match[1];
      transcription = transcription.replace(/\*(.*?)\*/, conjugatedSnippet);
    }
  }
  return { conjugatedSnippet, transcription };
}

/**
 * Editor upload audio file for review
 *
 * The audio file is uploaded to s3 but is tucked into the
 * idiom record under 'assigned: {}' so the admin can
 * review and tweak the audio before graduating it to
 * be an example.
 *
 * @param {Object} routeContext - Unified parameter object
 * @returns {Promise<Object>} - Updated example with audio information
 */
export async function assignmentFulfill(routeContext) {
  const { payload } = routeContext;
  const { idiomId, transcription, conjugatedSnippet, editor } = payload;

  try {
    // This WILL overwrite any previous file (by design)
    const filename = `${MAGIC_WORD}_${idiomId}.mp3`;
    const audioContent =
      payload.file !== "" && (payload.file || payload.files.file).data;
    const contentType = audioContent
      ? (payload.file || payload.files.file).mimetype || "audio/mpeg"
      : undefined;
    const audio = audioContent
      ? await uploadAudioToS3(audioContent, filename, contentType)
      : undefined;

    audio && editor && (audio.voice = editor);
    
    const assignment = {
      model: new IdiomModel(),
      idiomId,
      audio,
      ..._extractSnippet({ transcription, conjugatedSnippet }),
    };
    const rec = await _doAssign(assignment);

    rec.assigned.audio = await checkUrlExpiration(rec.assigned.audio || {});

    return rec;
  } catch (error) {
    console.error("Error uploading assignment audio file:", error);
    throw new Error(`Failed to upload audio: ${error.message}`);
  }
}
