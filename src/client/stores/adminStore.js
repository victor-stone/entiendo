// src/client/stores/adminStore.js
import { create } from 'zustand';
import adminService from '../services/adminService';
import { storeFetch } from '../lib/storeUtils';
const { createExample, uploadExampleAudio } = adminService;

export const useCreateExampleStore = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(createExample, set),
  reset: () => set({ data: null, error: null, loading: false })
}));

export const useUploadAudioStore = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(uploadExampleAudio, set),
  reset: () => set({ data: null, error: null, loading: false })
}));

export const useAdminStore = create((set, get) => ({
  // State
  idioms   : [],
  validated: null,
  loading  : false,
  error    : null,
  bugreport: null,
  
  // Actions
  resetState: () => set({
    idioms   : [],
    validated: null,
    bugreport: null,
    loading  : false,
    error    : null
  }),
  
  // Batch create idioms
  importIdioms: async (idioms, authToken) => {
    set({ loading: true, error: null, idioms: [] });
    
    try {
      const result = await adminService.importIdioms(idioms, authToken);
      set({ 
        idioms: [...result.created],
        loading: false
      });
      return result;
    } catch (err) {
      set({ 
        error: err.message || 'Failed to batch create idioms',
        loading: false 
      });
      return null;
    }
  },
  
  // Validate idioms without saving
  validateIdiomsFromCSV: async (file, authToken) => {
    set({ loading: true, error: null, validated: null });
    
    try {
      const validated = await adminService.validateIdiomsFromCSV(file, authToken);
      set({ 
        validated,
        loading: false 
      });
      return validated;
    } catch (err) {
      set({ 
        error: err.message || 'Failed to validate idioms',
        loading: false 
      });
      return null;
    }
  },

  // Create an idiom example with optional audio
  createIdiomExample: async (exampleData, audioFile, authToken) => {
    set({ loading: true, error: null });
    
    try {
      const result = await adminService.createIdiomExample(exampleData, audioFile, authToken);
      set({ loading: false });
      return result;
    } catch (err) {
      set({ 
        error: err.message || 'Failed to create idiom example',
        loading: false 
      });
      return null;
    }
  },

  reportBug: async (title, body, labels, token) => {
    set({ loading: true, error: null });
    
    try {
      const result = await adminService.reportBug(title,body,labels,token)
      set({ loading: false, bugreport: result });
      return result;
    } catch (err) {
      set({ 
        error: err.message,
        loading: false 
      });
      return null;
    }

  }
}));
