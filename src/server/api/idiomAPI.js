// src/server/api/idiomAPI.js
// Contains application logic for idiom-related operations
// No HTTP plumbing, routes, or direct database access

import { IdiomModel } from '../models/index.js';
import { 
  NotFoundError
} from '../../shared/constants/errorTypes.js';

/**
 * Get all unique tones of idioms
 * @param {Object} unified - Unified parameter object
 * @returns {Promise<Object>} - Object containing array of tones
 */
export async function getTones(unified) {
  const idiomModel = new IdiomModel();
  const tones = await idiomModel.getTones();
  return { tones };
}


/**
 * Get a specific idiom by ID
 * @param {Object} unified - Unified parameter object
 * @returns {Promise<Object>} - Idiom details or error
 */
export async function getIdiom(unified) {
  const { params } = unified;
  const idiomModel = new IdiomModel();
  
  const idiom = await idiomModel.getById(params.idiomId);
  
  if (!idiom) {
    throw new NotFoundError('Idiom not found');
  }
  
  return idiom;
}

/**
 * Get a list of all idioms with just their ID and text
 * @param {Object} unified - Unified parameter object
 * @returns {Promise<Object>} - Object containing array of idioms with id and text
 */
export async function getIdiomsList(unified) {
  const idiomModel = new IdiomModel();
  const idioms = await idiomModel.getIdiomsList();
  return { idioms };
}
