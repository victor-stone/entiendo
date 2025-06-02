import { post, postFile } from '../lib/apiClient';
import debug from 'debug';

const debugAdmin = debug('client:admin');

/**
 * Service for admin-related API operations
 */
const adminService = {
  /**
   * Create a new idiom
   * @param {Object} idiomData - Idiom data to create
   * @param {string} authToken - Authentication token
   * @returns {Promise<Object>} - Created idiom
   */
  createIdiom: async (idiomData, authToken) => {
    return await post('/api/admin/idiom', idiomData, authToken);
  },
  
  /**
   * Create a new example for an idiom
   * @param {Object} exampleData - Example data to create
   * @param {string} authToken - Authentication token
   * @returns {Promise<Object>} - Created example
   */
  createExample: async (exampleData, authToken) => {
    return await post('/api/admin/idiom-examples', exampleData, authToken);
  },
  
  /**
   * Upload audio for an example
   * @param {String} exampleId - ID of the example
   * @param {File} audioFile - Audio file to upload
   * @param {string} authToken - Authentication token
   * @returns {Promise<Object>} - Upload result
   */
  uploadExampleAudio: async (exampleId, audioFile, authToken) => {
    return await postFile('/api/admin/example-audio', audioFile, { exampleId }, authToken);
  },

  /**
  * Validate idioms without saving them
  * @param {Array} file - CSV file object
  * @param {string} authToken - Authentication token
  * @returns {Promise<Object>} - Object:
  *  {
       idioms,
       errors,
       duplicates,
       totalRecords
     }
  */  validateIdiomsFromCSV: async (file, authToken) => {
    return await postFile('/api/admin/idioms/validate', file, {}, authToken);
  },

  /**
   * Batch create multiple idioms
   * @param {Array} idioms - Array of idiom objects to create
   * @param {String} authToken - Authentication token
   * @returns {Promise<Object>} - Results of batch creation
   */
  importIdioms: async (idioms, authToken) => {
    return await post('/api/admin/idioms', { idioms }, authToken);
  },

  reportBug: async (title, body, labels, authToken) => {
    return await post('/api/admin/reportbug', { title, body, labels }, authToken);
  }
};

export default adminService; 