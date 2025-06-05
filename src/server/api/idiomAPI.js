// src/server/api/idiomAPI.js
import { IdiomModel, ExampleModel } from '../models/index.js';
import { NotFoundError } from '../../shared/constants/errorTypes.js';
import { finalizeExample } from './lib/finalizeExample.js';

/**
 * Get all unique tones of idioms
 * @param {Object} routeContext - Unified parameter object
 * @returns {Promise<Object>} - Object containing array of tones
 */
export async function getTones() {
  const idiomModel = new IdiomModel();
  const tones = await idiomModel.getTones();
  return tones;
}


/**
 * Get a specific idiom by ID
 * @param {Object} routeContext - Unified parameter object
 * @returns {Promise<Object>} - Idiom details or error
 */
export async function getIdiom(routeContext) {
  const { params: { idiomId } } = routeContext;
  const idiomModel = new IdiomModel();
  
  const idiom = await idiomModel.getById(idiomId);

  if (!idiom) {
    throw new NotFoundError('Idiom not found');
  }
  
  const model          = new ExampleModel();
  let   examples       = await model.findByIdiomId(idiomId);
        examples       = examples.map( e => finalizeExample(e) );
        idiom.examples = await Promise.all(examples);
  
  return idiom;
}

/**
 * Get a list of all idioms with just their ID and text
 * @param {Object} routeContext - Unified parameter object
 * @returns {Promise<Object>} - Object containing array of idioms with id and text
 */
export async function getIdiomsList(routeContext) {
  const { query: { full = false } } = routeContext;
  const idiomModel = new IdiomModel();
  let idioms = null;
  if( full ) {
    return await idiomModel.findAll();
  }
  idioms = await idiomModel.getIdiomsList();
  return { idioms };
}
