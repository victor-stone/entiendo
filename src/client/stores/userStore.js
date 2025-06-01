// src/client/stores/userStore.js
import { create } from 'zustand';
import userService from '../services/userService';
import debug from 'debug';

const debugLogin = debug('app:login');

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
  _login  : null,
  logout  : null,
  getToken: null,
  
  // Set auth data from Auth0
  setAuth: (authData) => {
    debugLogin('setAuth called with isAuthenticated=%s', authData.isAuthenticated);
    set({
      user           : authData.user,
      isAuthenticated: authData.isAuthenticated,
      loading        : authData.isLoading,
      _login         : authData.login,
      logout         : authData.logout,
      getToken       : authData.getToken,
      error          : authData.error
    });
  },
  
  login: async() => {
    set({ error: null });
    try {
      debugLogin('login called');
      const { _login } = get();
      _login();
    } catch(err) {
      debugLogin('Login error: %O', err);
      set({ error: err.message, loading: false });
    }
  },

  updatePreferences: async (prefs) => {
    const { getToken } = get();
    set({ loading: true, error: null });
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

  setPreference: async (key, value) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        [key]: value
      }
    }));
    const { preferences, updatePreferences } = get();
    await updatePreferences(preferences);
  },

  setFilter: async (filterKey, filterValue) => {
    const { preferences, setPreference } = get();
    const newFilter = {
      ...(preferences.filter || {}),
      [filterKey]: filterValue
    };
    await setPreference('filter', newFilter);
  },

  setTone:   (tone)   => get().setFilter('tone', tone),
  setUsage:  (usage)  => get().setFilter('usage', usage),

  // Sync user profile with backend
  syncProfile: async () => {
    const { isAuthenticated, getToken } = get();
    if (!isAuthenticated || !getToken) return null;
    
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      const result = await userService.syncUser(token);
      
      set({ 
        profile: result,
        isAdmin: result.role === 'admin',
        preferences: { ...result.preferences } ,
        loading: false
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