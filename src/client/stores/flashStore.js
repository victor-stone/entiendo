import { create } from 'zustand';
import flashService from '../services/flashService';
import { storeFetch } from '../lib/storeUtils';
const { getNext, evaluate } = flashService;
import { PHASES } from './sandboxStore'

export const useGetNextFlashStore = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(getNext, set),
  reset: () => set({ data: null, error: null, loading: false })
}));

export const useEvaluateFlashStore = create((set) => ({
  loading: false,
  error: null,
  data: null,
  evaluate: storeFetch(evaluate,set),
  reset: () => set({ data: null, error: null, loading: false })
}))


export const useFlashStore = create((set, get) => ({

  phase    : PHASES.prompt,
  userInput: {
    mode       : 'new',
    translation: ''
  },

  setPhase: (phase) => {
    if (phase in PHASES) {
      set({ phase });
    } else {
      console.error(`Invalid phase: ${phase}`);
    }
  },

  setMode: (mode) => {
    const translation = get().userInput.translation;
    set( { userInput: {
      mode,
      translation
    }});
  },

  setUserInput: (translation) => {
    const mode = get().userInput.mode;
    set({
      userInput: {
        translation:   translation || '',
        mode
      }
    });
  },

  reset: () => {
    const mode = get().userInput.mode;
    set({
      phase: PHASES.prompt,
      userInput: {
        translation: '',
        // DO NOT RESET MODE (this is persistant across flash cards)
        mode
      }
    });
  }
}));

