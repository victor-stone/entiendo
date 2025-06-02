import { create } from 'zustand';
import exerciseService from '../services/exerciseService';

// TODO: refact the F out of this 


const fetchAndSet = async (set, getToken, serviceFn, stateKey, errorMsg, loadingKey, errorKey, arg = null) => {
  if (!getToken) return null;
  set({ [loadingKey]: true, [errorKey]: null });
  try {
    const token = await getToken();
    const data = arg 
            ? await serviceFn(arg,token)
            : await serviceFn(token);
    set({
      [stateKey]: data,
      [loadingKey]: false
    });
    return data;
  } catch (err) {
    console.log(`ExerciseStore ${stateKey} error`, err);
    set({
      [errorKey]: err.message || errorMsg,
      [loadingKey]: false
    });
    return null;
  }
};

const useExerciseStore = create((set, get) => ({
  // State
  exercise    : null,
  loading     : false, // Only for exercise flow, not dashboard fetches
  error       : null,  // Only for exercise flow, not dashboard fetches
  phase       : 'prompt',
  evaluation  : null,
  progress    : null,
  dueList     : null,
  dueStats    : null,
  missedWords : null,
  calendarFull: false,
  example     : null,

  // Per-fetch loading and error states
  loadingDueList: false,
  errorDueList: null,
  loadingDueStats: false,
  errorDueStats: null,
  loadingMissedWords: false,
  errorMissedWords: null,
  loadingExample: false,
  errorExample: null,

  userInput        : {
    transcription: '',
    translation  : ''
  },

  // Set the current exercise
  setExercise: (exercise) => {
    set({ exercise });
  },

  // Get list of due exercises
  getDueList: (getToken) =>
    fetchAndSet(set, getToken, exerciseService.getDueList, 'dueList', 'Failed to fetch due exercises', 'loadingDueList', 'errorDueList'),

  // Get stats for due exercises
  getDueStats: (getToken) =>
    fetchAndSet(set, getToken, exerciseService.getDueStats, 'dueStats', 'Failed to fetch due stats', 'loadingDueStats', 'errorDueStats'),

  // Get missed words
  getMissedWords: (getToken) =>
    fetchAndSet(set, getToken, exerciseService.getMissedWords, 'missedWords', 'Failed to fetch missed words', 'loadingMissedWords', 'errorMissedWords'),

  getExample: (exampleId, getToken) =>
    fetchAndSet(set, getToken, exerciseService.getExample, 'example', 'Failed to fetch missed example', 'loadingExample', 'errorExample', exampleId),

  // Set the current phase of the exercise flow
  setPhase: (newPhase) => {
    if (!['prompt', 'input', 'evaluation', 'results'].includes(newPhase)) {
      console.error(`Invalid phase: ${newPhase}`);
      return;
    }
    set({ phase: newPhase });
  },
  
  // Set user input for transcription and translation
  setUserInput: (transcription, translation) => {
    set({
      userInput: {
        transcription: transcription || '',
        translation:   translation || ''
      }
    });
  },
  
  // Store evaluation results
  setevaluation: (results) => {
    set({ evaluation: results });
  },
  
  // Reset exercise state for a new exercise
  resetExercise: () => {
    set({
      phase: 'prompt',
      userInput: {
        transcription: '',
        translation: ''
      },
      evaluation: null,
      loading: false,
      // Reset dashboard fetch loading/error states as well
      loadingDueList: false,
      errorDueList: null,
      loadingDueStats: false,
      errorDueStats: null,
      loadingMissedWords: false,
      errorMissedWords: null,
      loadingExample: false,
      errorExample: null
    });
  },
  
  // Get next exercise based on criteria
  getNext: async (criteria, getToken) => {
    if (!getToken) return null;
    
    set({ 
      exercise    : null,
      loading     : true,
      error       : null,
      calendarFull: false  // <-- Clear calendarFull at the start
    });
    try {
      const token    = await getToken();
      const exercise = await exerciseService.getNext(criteria, token);
      
      set({ 
        exercise,
        loading: false,
        phase  : 'prompt'  // Reset to prompt phase for new exercise
      });
      
      return exercise;
    } catch (err) {
      console.log('ExerciseStore error', err);
      // Check for CalendarExhaustedError by code
      if (err.code === 'SERVICE_UNAVAILABLE') {
        set({
          error: 'No due idioms available. Please try again later.',
          loading: false,
          calendarFull: true // <-- Set calendarFull here
        });
      } else {
        set({ 
          error: err.message || 'Failed to fetch next exercise',
          loading: false
        });
      }
      return null;
    }
  },
  
  evaluateResponse: async (userTranscription, userTranslation, getToken) => {
    if (!getToken) return null;
    
    set({ loading: true, error: null });
    try {

      const token    = await getToken();
      const exercise = get().exercise;
      const { evaluation, progress } = await exerciseService.evaluateResponse(exercise.exampleId, userTranscription, userTranslation, token);
      set({ 
        loading: false,
        evaluation,
        progress,
      });
      return { evaluation, progress };
      
    } catch (err) {
      set({ error: err.message || 'Failed to evaluate response', loading: false });
      return null;
    }
  },  
  
  // Clear error (all errors)
  clearError: () => set({ 
    error: null,
    errorDueList: null,
    errorDueStats: null,
    errorMissedWords: null
  })
}));

export default useExerciseStore;