// src/server/api/idiomAPI.js
import { IdiomModelQuery, ExampleModelQuery } from '../models/index.js';
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
  const query = await IdiomModelQuery.create();
  return query.tones();
}

/**
 * Get a specific idiom by ID
 * @param {Object} routeContext - Unified parameter object
 * @returns {Promise<Object>} - Idiom details or error
 */
export async function getIdiom(routeContext) {
  const { params: { idiomId } } = routeContext;

  const query   = await IdiomModelQuery.create();
  const exQuery = await ExampleModelQuery.create();
  const idiom   = query.idiom(idiomId);

  if (!idiom) { throw new NotFoundError('Idiom not found'); }

  const force = true;

  idiom.examples = await Promise.all(exQuery.forIdiom(idiomId).map( e => finalizeExample(e,{force, debug: debugEx}) ));
  return idiom;
}

/**
 * Get a list of all idioms with just their ID and text
 * @param {Object} routeContext - Unified parameter object
 * @returns {Promise<Object>} - Object containing array of idioms with id and text
 */
export async function getIdiomsList(routeContext) {
  const { query: { full = false } } = routeContext;
  const query = await IdiomModelQuery.create();
  if( full ) {
    return query.idioms();
  }
  return query.getIdiomsList();
}
