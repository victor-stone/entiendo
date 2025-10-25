import { ForbiddenError, ValidationError } from '../../../shared/constants/errorTypes.js';
import { Idioms } from '../../models/index.js';

/**
 * Update a single idiom
 */
export async function updateIdiom(routeContext) {
  const { payload: idiomData, user: { role } } = routeContext;
  
  if (!role || role !== 'admin') {
    throw new ForbiddenError('Unauthorized. Admin role required.');
  }
  
  const idioms = new Idioms();  
  const createdIdiom = idioms.update(idiomData.idiomId, idiomData);
  return createdIdiom;
}

/**
 * Create a single idiom
 */
export async function createIdiom(routeContext) {
  const { payload: idiomData, user: { role } } = routeContext;
  if (!role || role !== 'admin') {
    throw new ForbiddenError('Unauthorized. Admin role required.');
  }
  
  const idioms = new Idioms();  

  const existingIdiom = idioms.findValue('text', idiomData.text);
  if (existingIdiom) {
    throw new ValidationError('Idiom with this text already exists');
  }
  
  const createdIdiom = idioms.create(idiomData);
  return createdIdiom;
}

