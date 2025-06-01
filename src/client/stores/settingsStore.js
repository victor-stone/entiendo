import { create } from 'zustand';
import settingsService from '../services/settingsService';
import debug from 'debug';

const debugSettings = debug('client:settings');

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

async function hashPassword(input, testKey) {
  const encoder    = new TextEncoder();
  const data       = encoder.encode(input + testKey);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

const useSettingsStore = create((set, get) => ({
  // State
  settings    : null,
  loading     : false,
  error       : null,
  needBetaTest: false,
  verifiedBeta: false,

  // Actions
  resetState: () => set({
    settings    : null,
    loading     : false,
    error       : null,
    needBetaTest: false,
    verifiedBeta: false
  }),

  // Fetch settings from API
  getSettings: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await settingsService.fetchSettings();
      debugSettings('got settings %o', settings)
      set({ settings, loading: false });
      return settings;
    } catch (err) {
      set({ error: err.message || 'Failed to fetch settings', loading: false });
      return null;
    }
  },

  // Check if beta test is needed
  checkForBetaTest: async () => {
    let { settings, loading } = get();
    if (!settings && !loading) {
      settings = await get().getSettings();
    }

    set({ needBetaTest: settings.inBeta });

    let verifiedBeta = false;
    if( settings.inBeta ) {
      const betaKey = getCookie('betaKey');
      verifiedBeta = betaKey && betaKey === settings.betaKey;
      set({ verifiedBeta });
    }

    return settings.inBeta && !verifiedBeta;
  },

  // Verify beta password
  verifyBetaPassword: async (password) => {
    const { settings } = get();
    if (!settings || !settings.testKey || !settings.betaKey) {
      set({ verifiedBeta: false });
      return false;
    }
    const hash = await hashPassword(password, settings.testKey);
    const result = hash === settings.betaKey;
    if (result) {
      document.cookie = `betaKey=${hash}; path=/; SameSite=Lax`;
      set({ verifiedBeta: true, needBetaTest: false });
    } else {
      set({ verifiedBeta: false });
    }
    return result;
  }
}));

export default useSettingsStore;