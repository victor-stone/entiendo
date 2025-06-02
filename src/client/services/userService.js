import { post } from '../lib/apiClient';

/**
 * Service for interacting with the User API
 */
const userService = {
  /**
   * Synchronize user data from Auth0 profile
   * This endpoint ensures the user exists in our database and is up-to-date
   * with their Auth0 profile information
   * 
   * @param {string} authToken - Authentication token
   * @returns {Promise<Object>} - User data
   */
  syncUser: async (authUser, authToken) => {
    return await post('/api/users/sync', {authUser}, authToken);
  },

  updatePreferences: async (preferences, authToken) => {
    return await post('/api/users/preferences', {preferences}, authToken);
  }
};

export default userService; 