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
    const model = new ExampleModel();
    return await model.update(exampleId, payload);

}
