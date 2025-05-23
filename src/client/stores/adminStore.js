// src/client/stores/adminStore.js
import { create } from 'zustand';
import adminService from '../services/adminService';

const useAdminStore = create((set, get) => ({
  // State
  idioms: [],
  validated: null,
  loading: false,
  error: null,
  
  // Actions
  resetState: () => set({
    idioms: [],
    validated: null,
    loading: false,
    error: null
  }),
  
  // Batch create idioms
  importIdioms: async (idioms, authToken) => {
    set({ loading: true, error: null });
    
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
      const results = await adminService.validateIdiomsFromCSV(file, authToken);
      set({ 
        validated: results,
        loading: false 
      });
      return results;
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
  }
}));

export default useAdminStore;
