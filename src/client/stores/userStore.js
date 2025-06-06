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
  authReady      : false, // TODO: this is a hack maybe
  
  // Auth methods
  logout  : null,
  getToken: null,
  
  setAuth: (authData) => {
    debugLogin('setAuth called with isAuthenticated=%s', authData.isAuthenticated);
    set({
      ...authData,
      authReady: true
    });
  },

  updatePreferences: async (prefs) => {
    debugLogin('update preferences=%o', prefs);
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
      debugLogin('set preference: %s => %o', key, value );

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

  setTone : (tone)   => get().setFilter('tone', tone),
  setUsage: (usage)  => get().setFilter('usage', usage),

  // Sync user profile with backend
  syncProfile: async (user) => {
    
    debugLogin('sync profile=%o', user);

    const { isAuthenticated, getToken } = get();
    if (!isAuthenticated || !getToken) return null;
    
    set({ loading: true, error: null });
    try {
      const token  = await getToken();
      const result = await userService.syncUser(user, token);
      set({ 
        profile    : result,
        isAdmin    : result.role === 'admin',
        preferences: { ...result.preferences },
        loading    : false
      });
      debugLogin('sync sync result=%o', result);
      return result;
    } catch (err) {
      debugLogin('Sync error %o', err);
      set({ 
        error: err.message || 'Failed to sync profile',
        loading: false
      });
      return null;
    }
  },
  
}));

export default useUserStore;