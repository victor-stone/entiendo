import { create } from 'zustand';
import exerciseService from '../services/exerciseService';
import { storeFetch } from '../lib/storeUtils';
const { getDueList, getDueStats, getMissedWords, getExample } = exerciseService;

export const useDueStatsStore = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(getDueStats, set),
  reset: () => set({ data: null, error: null, loading: false })
}));

export const useDueListStore = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(getDueList, set)
}));

export const useExampleStore = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(getExample, set)
}));

export const useMissedWordsStore = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(getMissedWords, set)
}));

const useExerciseStore = create((set, get) => ({

  loading     : false,
  error       : null,
  phase       : 'prompt',
  evaluation  : null,
  progress    : null,

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
    error: null
  })
}));

export default useExerciseStore;