import { IdiomModel, ExampleModel } from '../../models/index.js';
import { NotFoundError } from '../../../shared/constants/errorTypes.js';

/**
 * Get all examples for a specific idiom
 * @param {Object} routeContext - Unified parameter object
 * @returns {Promise<Object>} - Object containing array of examples for the idiom
 */
export async function getIdiomExamples(routeContext) {
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