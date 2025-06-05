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

const TEST_DATA = {    "evaluation": {
          "transcriptionFeedback": "You did well identifying most of the words, but there are some minor errors in spelling and word recognition.",
          "translationFeedback": "The translation doesn't capture the meaning of the original sentence. Focus on the roles of each word.",
          "englishTranslation": "The one who played music at the party didn't let anyone have a say.",
          "targetWords": [
            "el",
            "en",
            "opinar",
            "puso",
            "uno"
          ],
          "missedWords": [
            "opinar",
            "puso",
            "nadie"
          ]
        }
      }

export const useEvaluateSandboxStore = create((set) => ({
  loading: false,
  error: null,
  data: TEST_DATA.evaluation, // WHILE DEBUGGING null,
  evaluate: storeFetch(evaluate,set),
  reset: () => set({ data: null, error: null, loading: false })
}))

export const PHASES = {
  prompt: 'prompt',
  input: 'input',
  evaluation: 'evaluation',
  results: 'results'
};

const TEST_USER_INPUT = {
  userInput: {
        transcription: 'El uno que pusó la musicas en la fiest no de joya nadia pinar',
        translation: 'whoever puts the music on at the party is a no fun nobody'
      }
}
export const useSandboxStore = create((set, get) => ({

  // phase    : PHASES.prompt,
  // userInput: {
  //   transcription: '',
  //   translation:   ''
  // },

  // DEBUG CODE:
  userInput: TEST_USER_INPUT.userInput,
  phase: PHASES.results,

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

