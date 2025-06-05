import ProgressQuery from '../../shared/lib/query/ProgressQuery.js'
import ProgressModel from './ProgressModel.js';

let cache = {};

const ProgressModelQuery = {
    create: async (userId) => {
        if( !cache[userId] ) {
            const model = new ProgressModel();
            const data = await model.findByUser(userId);
            cache[userId] = new ProgressQuery(data);
        }
        return cache[userId];
    },
    reset: () => cache = {}
}

ProgressModel.onUpdate(ProgressModelQuery.reset);

export default ProgressModelQuery;