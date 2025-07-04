import {
  IdiomModel,
  ExampleModel,
  IdiomModelQuery,
  ExampleModelQuery,
  SettingsModel,
} from "../../models/index.js";
import debug from 'debug';
import { deleteAudioFromS3, uploadAudioToS3 } from "../../lib/audio.js";

const debugAss = debug('api:assign');

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

export async function assignEditorToIdiom(routeContext) {
  const { idiomId, source } = routeContext.payload;
  const model = new IdiomModel();
  return _doAssign({model, idiomId, source});
}

async function _doAssign({model, idiomId, ...remains}, erase = false) {
  const rec = await model.getById(idiomId);
  debugAss('doing %s %s %s', erase ? 'erase' : 'assign', remains.source || '', rec.text);
  let assigned = rec.assigned || {};
  if( erase ) {
    assigned = {};
  } else {
    const sync = assigned.sync || await _incSyncCounter();
    assigned = {
      ...(rec.assigned || {}),
      sync,
      date: Date.now(),
      ...remains
    }
  }
  return model.update(idiomId, { assigned });
}

export async function graduateAssignmentToExample(record) {

  return _doAssign({ model, idiomId: record.idiomId }, true);
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
  return await AUDIO_REPORTS[reportName](routeContext.payload);
}

async function _getAssignedIdioms({ editor }) {
  const idiomQuery = await IdiomModelQuery.create();
  return idiomQuery.assigned(editor);
}

async function _getAssignableIdioms({ context, usage }) {
  const idiomQuery = await IdiomModelQuery.create();
  const exampleQuery = await ExampleModelQuery.create();

  const idioms = idiomQuery.byCriteria(context, usage);

  return idioms.filter(({ idiomId }) => {
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
  const query = ExampleModelQuery.create();
  const example = query.example(exampleId);
  await deleteAudioFromS3(example.audio.publicUrl);
  const model = new ExampleModel();
  return await model.update(exampleId, { audio: {} });
}

export async function replaceAudioInExample({ exampleId, audio }) {
  await deleteAudio(exampleId, audio.source);
  await attachAudioToExample({ exampleId, audio });
}

/**
 * Editor upload audio file for review
 *
 * The audio file is uploaded to s3 but is tucked into the
 * idiom record under 'assigned: {}' so the admin can
 * review and tweak the audio before graduating it to
 * be an example.
 *
 * TODO: next is a function to 'graduate' the assigned
 * info to a ful fledged example.
 *
 * @param {Object} routeContext - Unified parameter object
 * @returns {Promise<Object>} - Updated example with audio information
 */
export async function assignmentFulfill(routeContext) {
  const { payload } = routeContext;
  const { idiomId, transcription, conjugatedSnippet } = payload;

  try {
    const timestamp    = Date.now();
    const filename     = `assigned_${idiomId.slice(-5)}_${timestamp}.mp3`;
    const audioContent = payload.file !== '' && (payload.file || payload.files.file).data;
    const contentType  = audioContent && ((payload.file || payload.files.file).mimetype || 'audio/mpeg');
    const audio        = audioContent && await uploadAudioToS3(audioContent, filename, contentType);


    const assignment = {
      model: new IdiomModel(),
      idiomId,
      audio,
      transcription,
      conjugatedSnippet
    }
    return await _doAssign(assignment);

  } catch (error) {
    console.error("Error uploading assignment audio file:", error);
    throw new Error(`Failed to upload audio: ${error.message}`);
  }
}
