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
    reset: (key, update) => {
        if( query && key ) {
            let rec = query.example(key);
            rec = { ...rec, ...update };            
            debugData('Updated ExampleModel cache');
        } else if( query ) {
            debugData('Clearing out the ExampleModel cache');
            query = null;
        }
    }

}

ExampleModel.onUpdate(ExampleModelQuery.reset);

export default ExampleModelQuery;