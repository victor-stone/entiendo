// src/server/api/exampleAPI.js
import { ExampleModel, IdiomModel } from '../models/index.js';
import { NotFoundError } from '../../shared/constants/errorTypes.js';
import { uploadExampleAudioFromHTTPForm } from './lib/uploadExampleAudioFromHttpForm.js';

export async function getExamplesForIdiom(routeContext) {
  const { params } = routeContext;
  
  if (!params.idiomId) {
    throw new Error('Idiom ID is required');
  }
  
  const idiomModel = new IdiomModel();
  const idiom = await idiomModel.getById(params.idiomId);
  
  if (!idiom) {
    throw new NotFoundError('Idiom not found');
  }
  
  const exampleModel = new ExampleModel();
  const examples = await exampleModel.findByIdiomId(params.idiomId);
  
  return { examples };
} 

export async function getExampleById(routeContext) {
    const { params: { exampleId } } = routeContext;
    const model = new ExampleModel();
    return await model.getById(exampleId);
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

    const model         = new ExampleModel();
    const example       = await model.getById(exampleId);
    const fileName      = _extractNameFromUrl(example?.audio?.publicUrl) || generateExampleAudioFilename(example);
    const audioFromForm = await uploadExampleAudioFromHTTPForm( payload, fileName );

    const {
      voice,

      // throw these away...
      contentType,
      file,
      files,

      // keep these...
      ...fields
    } = payload;


    const audio = {
      ...(example.audio || {}),
      ...(audioFromForm || {}),
    }

    if( voice ) {
      audio.voice = voice;
    }

    const update = { ...fields, audio };

    return await model.update(exampleId, update);
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
