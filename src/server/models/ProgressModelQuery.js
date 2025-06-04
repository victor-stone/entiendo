import ProgressQuery from '../../shared/lib/query/query.js'
import ProgressModel from './ProgressModel.js';

const ProgressModelQuery = {
    create: async (userId) => {
        const model = new ProgressModel();
        const data = await model.findByUser(userId);
        return new ProgressQuery(data);
    }
}

export default ProgressModelQuery;