import {
  Settings,
  Users,
  Idioms,
  Examples,
  Homework
} from "../../models/index.js";
import debug from "debug";
import { renameAudioInS3, setAudioUrl, getAudioUrl } from "../../lib/audio.js";
import { uploadExampleAudioFromHTTPForm } from "../lib/uploadExampleAudioFromHttpForm.js";

import { generateExampleAudioFilename } from "../exampleAPI.js";

const ASSIGN_ERASE = true;

const debugHW = debug("api:homework");

const MAGIC_WORD = 'assigned';

async function _incSyncCounter() {
  const settings = new Settings();
  const counter = settings.get("SYNC_COUNTER");
  await settings.put("SYNC_COUNTER", counter + 1);
  return counter;
}

/*
  ((((((((((()))))))))))
    MANAGE ASSIGNMENTS
  ((((((((((()))))))))))
*/

export async function editors() {
  const users = new Users();
  const all = users.matching();
  const editors = all.reduce( (arr, u) => {
    if(u.role == 'editor' || u.role == 'admin') {
      debugHW('Found editor: ' + u.editor)
      arr.push(u.editor);
    } 
    return arr;
  }, []);
  return editors.filter( e => !!e );
}

// called from client as /api/editor/assign

export async function assignEditorToIdiom(routeContext) {
  const { idiomId, source, homeworkId } = routeContext.payload;

  const _idioms   = new Idioms();
  const idiom     = _idioms.byId(idiomId);
  const _homework = new Homework();

  if( homeworkId ) {
    if( source ) {
      idiom.homework = _homework.update(
                            homeworkId, 
                            { source });
    } else {
      // TODO - clean up any audio!
      _homework.remove( homeworkId );
    }
  } else {
    idiom.homework = _homework.create( {
                          idiomId,
                          source
                        });
  }

   return idiom;
}

export async function homeworkPublish(routeContext) {
  const { idiomId, homework } = routeContext.payload;

  let _examples = new Examples();
  const example = {
      idiomId,
      text             : homework.transcription,
      conjugatedSnippet: homework.conjugatedSnippet,
      source           : homework.source,
      voice            : homework.source
  };

  if(homework.audio) {
    // Check if audio filename starts with 'assigned_' and rename if needed
    if (homework.audio?.includes( MAGIC_WORD + '_')) {
      const newFilename = generateExampleAudioFilename(rec);
      const { key, url, expires } = await renameAudioInS3(rec.audio, newFilename);
      example.audio = key;
      setAudioUrl( key, url, expires );
    } else {
      example.audio = homework.audio;
    }
  }
  
  const _homework = new Homework();
  _homework.remove( homework.homeworkId );

  return _examples.create(example);

}

/*
  ((((((((((()))))))))))
    GENERATE REPORTS
  ((((((((((()))))))))))
*/

export async function homeworkReports(routeContext) {
  const { reportName } = routeContext.payload;
  const AUDIO_REPORTS = {
    ASSIGNABLE_IDIOMS: _getAssignableIdioms,
    ASSIGNED_IDIOMS: _getAssignedIdioms,
  };
  
  const idioms = await AUDIO_REPORTS[reportName](routeContext.payload);

  return idioms;
}

async function _getAssignedIdioms({ editor }) {
  const _homework = new Homework();
  const a = editor 
              ? _homework.forEditor(editor) 
              : _homework.all();

  const _idioms = new Idioms();

  const result = a.map( async a => {
    if( a.audio ) {
      a.url = await getAudioUrl(a.audio);
    }
    const idiom = _idioms.byId(a.idiomId);
    idiom.homework = a;
    return idiom;
  });

  return await Promise.all(result);
}

async function _getAssignableIdioms() {
  const _homework = new Homework();
  const _idioms   = new Idioms();
  const _examples = new Examples();
  const idioms    = _idioms.all();
  const results   = [];

  for( var n = 0; n < idioms.length; n++ ) {
    const idiom = idioms[n];
    const homeworks = _homework.forIdiom(idiom.idiomId);
    if( homeworks?.length ) {
      for( var i = 0; i < homeworks.length; i++ ) {
        const homework = homeworks[i];
        if( homework.audio ) {
          homework.url = await getAudioUrl(homework.audio);
        }
        results.push({ ...idiom, homework });
      }
    } else {
      const examples = _examples.forIdiom(idiom.idiomId);
      if( !examples?.length ) {
        results.push(idiom)
      }
    }
  }

  return results;
}

/*
  ((((((((((()))))))))))
      MANAGE FILES
  ((((((((((()))))))))))
*/


function _extractSnippet({ transcription, conjugatedSnippet }) {
  if (!conjugatedSnippet) {
    const match = transcription.match(/\*(.*?)\*/);
    if (match) {
      conjugatedSnippet = match[1];
      transcription = transcription.replace(/\*(.*?)\*/, conjugatedSnippet);
    }
  }
  return { transcription, conjugatedSnippet };
}

/**
 * Editor upload audio file for review
 *
 * @param {Object} routeContext - Unified parameter object
 * @returns {Promise<Object>} - Updated example with audio information
 */
export async function turnInHomework(routeContext) {
  const { payload } = routeContext;
  const { idiomId, transcription, conjugatedSnippet, 
    editor, homeworkId } = payload;

    // TODO if homework already has audio, need to
    // delete it

  try {
    // Use helper to handle file extraction and upload
    const filename = `${MAGIC_WORD}_${homeworkId}.mp3`;
    const { key, url = '', expires = 0} = await uploadExampleAudioFromHTTPForm(payload, filename);
    key && setAudioUrl( key, url, expires  );

    const _homework = new Homework();

    const homework = {
      audio: key,
      voice: editor,
      ..._extractSnippet({ transcription, conjugatedSnippet }),
    };
    const idiom = (new Idioms()).byId(idiomId);
    idiom.homework = _homework.update( homeworkId, { ...homework } );
    if( url ) idiom.homework.url = url; 
    return idiom;

  } catch (error) {
    console.error("Error uploading homework audio file:", error);
    throw new Error(`Failed to upload audio: ${error.message}`);
  }
}

