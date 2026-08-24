// src/client/stores/userStore.js
import { create } from 'zustand';
import userService from '../services/userService';
import debug from 'debug';
import {
  DEFAULT_VOICE_TYPE,
  VOICE_TYPE,
  normalizeVoiceType
} from '../../shared/constants/voiceTypes';

const debugLogin = debug('app:login');

// Preference writes are serialized so rapid on-exercise toggles cannot arrive
// at the server out of order and leave an older selection persisted last.
let preferencesWriteQueue = Promise.resolve();

const normalizePreferences = (preferences = {}) => ({
  ...(preferences || {}),
  [VOICE_TYPE]: normalizeVoiceType(preferences?.[VOICE_TYPE])
});

export const useUserStore = create((set, get) => ({
  // State
  user           : null,
  profile        : null,
  isAuthenticated: false,
  isAdmin        : false,
  loading        : false,
  preferencesLoading: false,
  preferencesRequestId: 0,
  error          : null,
  token          : null,
  preferences    : { [VOICE_TYPE]: DEFAULT_VOICE_TYPE },
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
    const requestId = get().preferencesRequestId + 1;
    set({
      preferencesLoading: true,
      preferencesRequestId: requestId,
      error: null
    });

    const update = async () => {
      try {
        const token = await getToken();
        const preferences = normalizePreferences(
          await userService.updatePreferences(prefs, token)
        );
        if (get().preferencesRequestId === requestId) {
          set({
            preferences,
            preferencesLoading: false
          });
        }
      } catch(err) {
        if (get().preferencesRequestId === requestId) {
          set({
            error: err.message || 'Failed to update preferences',
            preferencesLoading: false
          });
        }
      }
    };

    const queuedUpdate = preferencesWriteQueue.then(update, update);
    preferencesWriteQueue = queuedUpdate.catch(() => undefined);
    return queuedUpdate;
  },

  setPreference: async (key, value) => {
      debugLogin('set preference: %s => %o', key, value );

    const normalizedValue = key === VOICE_TYPE
      ? normalizeVoiceType(value)
      : value;

    set((state) => ({
      preferences: {
        ...state.preferences,
        [key]: normalizedValue
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
      const preferences = normalizePreferences(result.preferences);
      set({ 
        profile    : { ...result, preferences },
        isAdmin    : result.role === 'admin',
        preferences,
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
