import { post, get } from '../lib/apiClient';

const sandboxService = {
    getNext: async (basedOn, token) => {
        return post('/api/sandbox/next', { basedOn }, token );
    },

    evaluate: async (shovelId, userTranscription, userTranslation, token ) => {
        return post('/api/sandbox/evaluate', { shovelId, userTranscription, userTranslation }, token)
    },

    getBasedOn: async (token) => {
        return get('/api/sandbox/basedOn', token );
    },

}

export default sandboxService;
