import { create } from 'zustand';
import idiomService from '../services/idiomService';
import debug from 'debug';

const debugIdioms = debug('app:idioms');

const useIdiomStore = create((set, get) => ({
  // State
  tones  : [],
  loading: false,
  loadingIdiom: false,
  error  : null,
  idioms : null,
  idiom  : null,
  // UI State for IdiomTable
  idiomTableSort: { key: 'text', direction: 'ascending' },
  idiomTableFilter: '',
  idiomTableScroll: 0,
  idiomTableTone: 'all',
  setIdiomTableSort: (sort) => set({ idiomTableSort: sort }),
  setIdiomTableFilter: (filter) => set({ idiomTableFilter: filter }),
  setIdiomTableScroll: (scroll) => set({ idiomTableScroll: scroll }),
  setIdiomTableTone: (tone) => set({ idiomTableTone: tone }),

  getIdioms: async (full = false) => {
    set({ loading: true, idioms: null, error: null });
    try {
      const idioms = await idiomService.getIdiomsList(full);
      set({ loading: false, idioms })
      return idioms;
    } catch(err) {
      debugIdioms('error getting idioms %o', err);
      set({ error: err.message, loading: false });
    }
  },

  getIdiom: async (idiomId) => {
    const {idiom} = get();  
    if( idiom ) {
      return idiom;
    }
    set({ idiom: null, error: null, loadingIdiom: true });
    try {
      const idiom = await idiomService.getIdiom(idiomId);
      set({ idiom, loadingIdiom: false })
      return idiom;
    } catch(err) {
      debugIdioms('error getting idiom %o', err);
      set({ error: err.message, loadingIdiom: false });
    }
  },

  // Get all tones
  getTones: async () => {
    const { tones } = get();
    
    // Return cached tones if already loaded
    if (tones.length > 0) return { tones };
    
    set({ loading: true, tones: null, error: null });
    try {
      const data = await idiomService.getTones();
      set({ 
        tones: data.tones || [],
        loading: false
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
  resetError: () => set({ error: null }),
  
  resetIdiom: () => set({ idiom: null })
}));

export default useIdiomStore;