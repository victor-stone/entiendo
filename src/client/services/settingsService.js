import { get } from '../lib/apiClient';
import debug from 'debug';

const debugSettings = debug('client:settings');

/**
 * Service for settings-related API operations
 */
const settingsService = {
  /**
   * Fetch application settings
   * @returns {Promise<Object>} - Settings object from the server
   */
  fetchSettings: async () => {
    debugSettings('Fetching settings from /api/settings');
    return await get('/api/settings');
  }
};

export default settingsService;