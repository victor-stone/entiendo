import ExampleQuery from '../../shared/lib/query/query.js'
import ExampleModel from './ExampleModel.js';

const query = null;

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

export default ExampleModelQuery;