import { ForbiddenError, ValidationError } from '../../../shared/constants/errorTypes.js';
import { IdiomModel, IdiomModelQuery } from '../../models/index.js';

/**
 * Update a single idiom
 */
export async function updateIdiom(routeContext) {
  const { payload: idiomData, user: { role } } = routeContext;
  
  if (!role || role !== 'admin') {
    throw new ForbiddenError('Unauthorized. Admin role required.');
  }
  
  const idiomModel = new IdiomModel();  
  const createdIdiom = await idiomModel.update(idiomData.idiomId, idiomData);
  return createdIdiom;
}

/**
 * Create a single idiom
 */
export async function createIdiom(routeContext) {
  const { payload: idiomData, user: { role } } = routeContext;
  const query = await IdiomModelQuery.create();

  if (!role || role !== 'admin') {
    throw new ForbiddenError('Unauthorized. Admin role required.');
  }
  
  const existingIdiom = query.matchText(idiomData.text);
  if (existingIdiom) {
    throw new ValidationError('Idiom with this text already exists');
  }
  
  const idiomModel = new IdiomModel();  
  const createdIdiom = await idiomModel.create(idiomData);
  return createdIdiom;
}

