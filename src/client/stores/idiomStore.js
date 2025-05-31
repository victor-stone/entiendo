import { create } from 'zustand';
import idiomService from '../services/idiomService';
import debug from 'debug';

const debugIdioms = debug('app:idioms');

const useIdiomStore = create((set, get) => ({
  // State
  tones: [],
  loading: false,
  error: null,
  idioms: null,

  getIdioms: async (full = false) => {
    set({ loading: true });
    try {
      const idioms = await idiomService.getIdiomsList(full);
      set({ 
        loading: false,
        idioms
      })
      return idioms;
    } catch(err) {
      debugIdioms('error getting idioms %o', err);
    }
  },

  // Get all tones
  getTones: async () => {
    const { tones } = get();
    
    // Return cached tones if already loaded
    if (tones.length > 0) return { tones };
    
    set({ loading: true });
    try {
      const data = await idiomService.getTones();
      set({ 
        tones: data.tones || [],
        loading: false,
        error: null 
      });
      return data;
    } catch (err) {
      set({ 
        error: err.message || 'Failed to load tones',
        loading: false 
      });
      return { tones: [] };
    }
  },
  
  // Reset error state
  resetError: () => set({ error: null })
}));

export default useIdiomStore; 