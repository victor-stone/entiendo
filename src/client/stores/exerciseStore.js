import { create } from 'zustand';
import exerciseService from '../services/exerciseService';
const { getSchedule, getScheduleStats, getNext, evaluateResponse } = exerciseService;
import debug from 'debug';
const debugStore = debug('app:store');
import { storeFetch } from '../lib/storeUtils';

export const useScheduleStatsStore = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(getScheduleStats, set),
  reset: () => {
    debugStore('Clearing useScheduleStatsStore')
    return set({ data: null, error: null, loading: false })
  }
}));

export const useScheduleStore = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(getSchedule, set),
  reset: () => {
    debugStore('Clearing useScheduleStore')
    return set({ data: null, error: null, loading: false })
  }
}));

export const useExerciseStore = create((set, get) => ({

  loading   : false,   // this is for getNext/evaluateResponse
  error     : null,
  exercise  : null,
  evaluation: null,
  progress  : null,

  calendarFull: false,

  userInput: {
    transcription: '',
    translation: ''
  },

  phase       : 'prompt',

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
      loading   : false,   // this is for getNext/evaluateResponse
      error     : null,
      exercise  : null,
      evaluation: null,
      progress  : null,

      calendarFull:false,

      phase     : 'prompt',
      userInput : {
        transcription: '',
        translation: ''
      },
    });
  },
  
  // Get next exercise based on criteria
  getNext: async (criteria, getToken) => {
    if (!getToken) return null;
    
    set({ 
      exercise    : null,
      loading     : true,
      error       : null,
      calendarFull: false
    });
    try {
      const token    = await getToken();
      const exercise = await getNext(criteria, token);
      
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
          error       : 'No due idioms available. Please try again later.',
          loading     : false,
          calendarFull: true
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
      const { evaluation, progress } = await evaluateResponse(exercise.exampleId, userTranscription, userTranslation, token);
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
