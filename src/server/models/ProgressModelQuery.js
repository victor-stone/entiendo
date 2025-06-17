import ProgressQuery from '../../shared/lib/query/ProgressQuery.js'
import ProgressModel from './ProgressModel.js';
import debug from 'debug';

const debugData = debug('api:data');

let cache = {};

const ProgressModelQuery = {
    create: async (userId) => {
        if( !cache[userId] ) {
            debugData('No ProgressModel query found, creating one');
            const model = new ProgressModel();
            const data = await model.findByUser(userId);
            cache[userId] = new ProgressQuery(data);
        }
        return cache[userId];
    },
    reset: () => {
        cache = {};
        debugData('Cleared the ProgressModel cache %o', cache)
    }
}

ProgressModel.onUpdate(ProgressModelQuery.reset);

export default ProgressModelQuery;