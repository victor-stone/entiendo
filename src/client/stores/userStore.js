// src/client/stores/userStore.js
import { create } from 'zustand';
import userService from '../services/userService';

const useUserStore = create((set, get) => ({
  // State
  user           : null,
  profile        : null,
  isAuthenticated: false,
  isAdmin        : false,
  loading        : false,
  error          : null,
  token          : null,
  preferences    : {},
  
  // Auth methods
  login   : null,
  logout  : null,
  getToken: null,
  
  // Set auth data from Auth0
  setAuth: (authData) => set({
    user           : authData.user,
    isAuthenticated: authData.isAuthenticated,
    loading        : authData.isLoading,
    login          : authData.login,
    logout         : authData.logout,
    getToken       : authData.getToken
  }),
  
  updatePreferences: async (prefs) => {
    const { getToken } = get();
    set({ loading: true });
    try {
      const token = await getToken();
      const preferences = await userService.updatePreferences(prefs, token);
      set({ 
          preferences,
          loading: false
       })
    } catch(err) {
      set({ 
        error: err.message || 'Failed to sync profile',
        loading: false
      });
    }
  },

  setFilter: async (key, value) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        filter: {
          ...(state.preferences.filter || {}),
          [key]: value
        }
      }
    }));
    const { preferences, updatePreferences } = get();
    await updatePreferences(preferences);
  },

  setTone:   (tone)   => get().setFilter('tone', tone),
  setUsage:  (usage)  => get().setFilter('usage', usage),

  // Sync user profile with backend
  syncProfile: async () => {
    const { isAuthenticated, getToken } = get();
    if (!isAuthenticated || !getToken) return null;
    
    set({ loading: true });
    try {
      const token = await getToken();
      const result = await userService.syncUser(token);
      
      set({ 
        profile: result,
        isAdmin: result.role === 'admin',
        preferences: { ...result.preferences } ,
        loading: false,
        error: null
      });
      
      return result;
    } catch (err) {
      set({ 
        error: err.message || 'Failed to sync profile',
        loading: false
      });
      return null;
    }
  },
  
}));

export default useUserStore;