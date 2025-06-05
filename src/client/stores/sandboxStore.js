import { create } from 'zustand';
import sandboxService from '../services/sandboxService';
import { storeFetch } from '../lib/storeUtils';
const { getNext, evaluate } = sandboxService;

export const useGetNextSandboxStore = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(getNext, set),
  reset: () => set({ data: null, error: null, loading: false })
}));

export const useEvaluateSandboxStore = create((set) => ({
  loading: false,
  error: null,
  data: null,
  evaluate: storeFetch(evaluate,set),
  reset: () => set({ data: null, error: null, loading: false })
}))

export const PHASES = {
  prompt: 'prompt',
  input: 'input',
  evaluation: 'evaluation',
  results: 'results'
};

export const useSandboxStore = create((set, get) => ({

  phase    : PHASES.prompt,
  userInput: {
    transcription: '',
    translation:   ''
  },

  setPhase: (phase) => {
    if (phase in PHASES) {
      set({ phase });
    } else {
      console.error(`Invalid phase: ${phase}`);
    }
  },

  setUserInput: (transcription, translation) => {
    set({
      userInput: {
        transcription: transcription || '',
        translation:   translation || ''
      }
    });
  },

  reset: () => {
    set({
      phase: PHASES.prompt,
      userInput: {
        transcription: '',
        translation: ''
      }
    });
  }
}));

