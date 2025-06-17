import { post } from '../lib/apiClient';

const sandboxService = {
    getNext: async (basedOn, token) => {
        return post('/api/sandbox/next', { basedOn }, token );
    },

    evaluate: async (exampleId, userTranscription, userTranslation, token ) => {
        return post('/api/sandbox/evaluate', { exampleId, userTranscription, userTranslation }, token)
    }
}

export default sandboxService;
