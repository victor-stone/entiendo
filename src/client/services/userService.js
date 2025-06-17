import { post } from '../lib/apiClient';

/**
 * Service for interacting with the User API
 */
const userService = {

  syncUser: async (authUser, authToken) => {
    return await post('/api/users/sync', {authUser}, authToken);
  },

  updatePreferences: async (preferences, authToken) => {
    return await post('/api/users/preferences', {preferences}, authToken);
  }
};

export default userService; 