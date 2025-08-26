// src/server/api/exampleAPI.js
import { ExampleModel, IdiomModel } from '../models/index.js';
import { NotFoundError } from '../../shared/constants/errorTypes.js';

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

export async function updateExample(routeContext) {
    const { params: { exampleId }, payload } = routeContext;

    const model   = new ExampleModel();
    const example = await model.getById(exampleId);
    const audio   = { ...(example.audio || {}) };

    const {
      voice,
      ...fields
    } = payload;

    if( fields.contentType ) {
      delete fields.contentType;
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
