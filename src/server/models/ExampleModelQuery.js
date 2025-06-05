import {ExampleQuery} from '../../shared/lib/query/index.js'
import ExampleModel from './ExampleModel.js';

let query = null;

const ExampleModelQuery = {
    create: async () => {
        if( !query ) {
            const model = new ExampleModel();
            const data = await model.findAll();
            query = new ExampleQuery(data);
        }
        return query;
    },
    reset: () => query = null

}

ExampleModel.onUpdate(ExampleModelQuery.reset);

export default ExampleModelQuery;