// src/server/api/exampleAPI.js
import { ExampleModel } from '../models/index.js';

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
