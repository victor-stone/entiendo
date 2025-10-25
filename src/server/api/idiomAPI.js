// src/server/api/idiomAPI.js
import { Idioms, Examples } from '../models/index.js';
import { NotFoundError } from '../../shared/constants/errorTypes.js';
import { finalizeExample } from './lib/finalizeExample.js';

import debug from 'debug';

const debugEx = debug('api:example')
/**
 * Get all unique tones of idioms
 * @param {Object} routeContext - Unified parameter object
 * @returns {Promise<Object>} - Object containing array of tones
 */
export async function getTones() {
  const _idioms = new Idioms();
  return _idioms.tones();
}

/**
 * Get a specific idiom by ID
 * @param {Object} routeContext - Unified parameter object
 * @returns {Promise<Object>} - Idiom details or error
 */
export async function getIdiom(routeContext) {
  const { params: { idiomId } } = routeContext;

  const _idioms = new Idioms();
  const idiom   = _idioms.find(idiomId);


  if (!idiom) { throw new NotFoundError('Idiom not found'); }

  const options = {
    force: false,
    debug: debugEx
  }
  
  const _examples = new Examples();
  idiom.examples = await Promise.all(_examples.forIdiom(idiomId).map( e => finalizeExample(e,options) ));

  return idiom;
}

/**
 * Get a list of all idioms with just their ID and text
 * @param {Object} routeContext - Unified parameter object
 * @returns {Promise<Object>} - Object containing array of idioms with id and text
 */
export async function getIdiomsList(routeContext) {
  const { query: { full = false } } = routeContext;
  const _idioms = new Idioms();
  if( full ) {
    return _idioms.all();
  }
  return _idioms.directory();
}
