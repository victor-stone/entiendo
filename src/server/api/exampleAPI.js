// src/server/api/exampleAPI.js
import { Examples, Idioms } from '../models/index.js';
import { NotFoundError } from '../../shared/constants/errorTypes.js';
import { uploadExampleAudioFromHTTPForm } from './lib/uploadExampleAudioFromHttpForm.js';
import { setAudioUrl } from '../lib/audio.js';

export function getExamplesForIdiom(routeContext) {
  const { params } = routeContext;
  
  if (!params.idiomId) {
    throw new Error('Idiom ID is required');
  }
  
  const _idioms = new Idioms();
  const idiom = _idioms.byId(params.idiomId);
  
  if (!idiom) {
    throw new NotFoundError('Idiom not found');
  }
  
  const _examples = new Examples();
  const examples = _examples.forIdiom(params.idiomId);
  
  return { examples };
} 

export function getExampleById(routeContext) {
    const { params: { exampleId } } = routeContext;
    const x = new Examples();
    return x.byId(exampleId);
}

function _extractNameFromUrl(url) {
  if( !url ) {
    return null;
  }
  const tts = decodeURIComponent(url.toString().split('/').pop());
  return tts.replace('tts/','');
}

export async function updateExample(routeContext) {
    const { params: { exampleId }, payload } = routeContext;

    const _examples = new Examples();
    const example   = _examples.byId(exampleId);
    const fileName  = _extractNameFromUrl(example.audio) || generateExampleAudioFilename(example);

    const { key, url, expires } = await uploadExampleAudioFromHTTPForm( payload, fileName );

    const {
      text,
      conjugatedSnippet,
      voice
    } = payload;

    const update = { 
      text,
      conjugatedSnippet,
      voice,
    };

    if( key ) {
      setAudioUrl( key, url, expires );
      update.audio = key;
    }

    // TODO: delete existing audio if its there

    return _examples.update(exampleId, update);
}

/**
 * Generates a unique, S3-safe audio filename for an example record
 * @param {object} example - The example record (should have id and text fields)
 * @returns {string} - The generated filename (e.g. example_abc123_hello_world_1720377600000.mp3)
 */
export function generateExampleAudioFilename(example) {
  const base = example.exampleId;
  const text = example.text.toString().substring(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const timestamp = Date.now();
  return `${text}_${base}_${timestamp}.mp3`;
}
