import { get } from '../lib/apiClient';

/**
 * Service for interacting with the Idiom API
 */
const idiomService = {
  /**
   * Get all tones of idioms
   * @returns {Promise<Array>} - List of tones
   */
  getTones: async () => {
    return await get('/api/idioms/tones');
  },
    
  /**
   * Get list of idioms
   * @returns {Promise<Array>} - List of idioms
   */
  getIdiomsList: async (full = false) => {
    const query = full ? '?full=true' : '';
    return await get(`/api/idioms${query}`);
  },
  
  getIdioms: async() => {
    return get('/api/idioms?full=true');
  },

  getIdiom: async (idiomId) => {
    return await get(`/api/idiom/${idiomId}`);
  }

};

export default idiomService;
