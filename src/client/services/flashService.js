import { post } from '../lib/apiClient';

const flashService = {
    getNext: async (mode, token) => {
        return post('/api/flash/next', { mode }, token );
    },

    evaluate: async (flashId, userTranslation, token ) => {
        return post('/api/flash/evaluate', { flashId, userTranslation }, token)
    }
}

export default flashService;
