import IdiomQuery from '../../shared/lib/query/IdiomQuery.js'
import IdiomModel from './IdiomModel.js';
import debug from 'debug';

const debugData = debug('api:data');

let cache = null;

const IdiomModelQuery = {
    create: async () => {
        if( !cache ) {
            const model = new IdiomModel();
            const data  = await model.findAll();
                  cache = new IdiomQuery(data);
        }
        return cache;
    },
    reset: () => {
        cache = null;
        debugData('Cleared IdiomModel query cache');
    }
}

IdiomModel.onUpdate(IdiomModelQuery.reset);
export default IdiomModelQuery;