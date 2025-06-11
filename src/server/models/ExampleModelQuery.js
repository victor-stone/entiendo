import {ExampleQuery} from '../../shared/lib/query/index.js'
import ExampleModel from './ExampleModel.js';
import debug from 'debug';

const debugData = debug('api:data');

let query = null;

const ExampleModelQuery = {
    create: async () => {
        if( query ) {
            debugData('Found ExampleModelQuery cache');
        } else {
            debugData('No ExampleModelQuery cache found - creating a new one')
            const model = new ExampleModel();
            const data = await model.findAll();
            query = new ExampleQuery(data);
        }
        return query;
    },
    reset: () => {
        debugData('Clearing out the ExampleModel cache');
        query = null;
    }

}

ExampleModel.onUpdate(ExampleModelQuery.reset);

export default ExampleModelQuery;