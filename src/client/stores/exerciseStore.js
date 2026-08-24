import { create } from 'zustand';
import exerciseService from '../services/exerciseService';
const { getSchedule, getScheduleStats, 
  getNext, evaluateResponse, resolveAudioVariant } = exerciseService;
import debug from 'debug';
const debugStore = debug('app:store');
import { storeFetch } from '../lib/storeUtils';
import {
  VOICE_CONVERSATION,
  VOICE_EDUCATION,
} from '../../shared/constants/voiceTypes';

const validVoiceTypes = new Set([VOICE_CONVERSATION, VOICE_EDUCATION]);

const getCanonicalPlayback = (payload) => {
  const playback = payload?.playback;
  if (
    !playback ||
    typeof playback !== 'object' ||
    typeof playback.url !== 'string' ||
    !playback.url ||
    !validVoiceTypes.has(playback.voiceType)
  ) {
    return null;
  }

  return playback;
};

const getInitialAudioState = (exercise) => {
  const playback = getCanonicalPlayback(exercise);

  if (!playback) {
    return {
      activeVoiceType: VOICE_CONVERSATION,
      playbackByType: {},
      audioError: exercise?.warning || null,
    };
  }

  return {
    activeVoiceType: playback.voiceType,
    playbackByType: {
      [playback.voiceType]: playback,
    },
    audioError: exercise?.warning || null,
  };
};

export const useScheduleStatsStore = create((set, get) => ({
  loading: false,
  error  : null,
  data   : null,
  fetch  : storeFetch(getScheduleStats, set),
  reset  : () => {
    debugStore('Clearing useScheduleStatsStore')
    return set({ data: null, error: null, loading: false })
  }
}));

export const useScheduleStore = create((set, get) => ({
  loading: false,
  error  : null,
  data   : null,
  fetch  : storeFetch(getSchedule, set),
  reset  : () => {
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

  activeVoiceType: VOICE_CONVERSATION,
  playbackByType : {},
  audioLoading   : false,
  audioError     : null,
  audioRequestId : 0,

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

      activeVoiceType: VOICE_CONVERSATION,
      playbackByType : {},
      audioLoading   : false,
      audioError     : null,
      audioRequestId : get().audioRequestId + 1,

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
      calendarFull: false,
      activeVoiceType: VOICE_CONVERSATION,
      playbackByType : {},
      audioLoading   : false,
      audioError     : null,
      audioRequestId : get().audioRequestId + 1,
    });
    try {
      const token    = await getToken();
      const exercise = await getNext(criteria, token);
      
      set({
        exercise,
        loading: false,
        phase  : 'prompt',  // Reset to prompt phase for new exercise
        ...getInitialAudioState(exercise),
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

  switchVoiceType: async (voiceType, getToken) => {
    if (!validVoiceTypes.has(voiceType)) {
      set({ audioError: 'That audio style is not available.' });
      return null;
    }
    const requestedVoiceType = voiceType;

    const state = get();
    const cachedPlayback = state.playbackByType[requestedVoiceType];
    const requestId = state.audioRequestId + 1;

    if (cachedPlayback) {
      set({
        activeVoiceType: requestedVoiceType,
        audioLoading: false,
        audioError: null,
        audioRequestId: requestId,
      });
      return cachedPlayback;
    }

    const exampleId = state.exercise?.exampleId;
    if (!exampleId || !getToken) {
      set({ audioError: 'Unable to load that audio style right now.' });
      return null;
    }

    const previousVoiceType = state.activeVoiceType;
    set({
      activeVoiceType: requestedVoiceType,
      audioLoading: true,
      audioError: null,
      audioRequestId: requestId,
    });

    try {
      const token = await getToken();
      const response = await resolveAudioVariant(
        exampleId,
        requestedVoiceType,
        token
      );
      const playback = getCanonicalPlayback(response);

      if (!playback) {
        throw new Error('The requested audio style is unavailable.');
      }

      // A reset, a new exercise, or a later switch makes this response stale.
      if (
        get().audioRequestId !== requestId ||
        get().exercise?.exampleId !== exampleId
      ) {
        return playback;
      }

      const warning = response.warning || null;
      set((current) => ({
        activeVoiceType: playback.voiceType,
        playbackByType: {
          ...current.playbackByType,
          [playback.voiceType]: playback,
        },
        audioLoading: false,
        audioError: warning,
      }));
      return playback;
    } catch (err) {
      if (
        get().audioRequestId === requestId &&
        get().exercise?.exampleId === exampleId
      ) {
        set({
          activeVoiceType: previousVoiceType,
          audioLoading: false,
          audioError: err.message || 'Failed to load that audio style.',
        });
      }
      return null;
    }
  },
  
  evaluateResponse: async (userTranscription, userTranslation, getToken) => {
    if (!getToken) return null;
    
    set({ loading: true, error: null });
    try {

      const state = get();
      const exercise = state.exercise;
      const selectedPlayback = state.playbackByType[state.activeVoiceType];
      const availablePlayback = selectedPlayback || Object.values(state.playbackByType)[0];
      const voiceTypeUsed = availablePlayback?.voiceType || state.activeVoiceType;
      const token = await getToken();
      const { evaluation, progress } = await evaluateResponse(
        exercise.exampleId,
        userTranscription,
        userTranslation,
        token,
        voiceTypeUsed
      );
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
  }),

  clearAudioError: () => set({
    audioError: null,
  }),
}));
