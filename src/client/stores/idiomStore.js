import { create } from 'zustand';
import idiomService from '../services/idiomService';
import { storeFetch } from '../lib/storeUtils';
const { getIdiom, getIdiomsList, getTones } = idiomService;

export const useIdiomStore = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(getIdiom, set),
  reset: () => set({ data: null, error: null, loading: false })
}));

export const useIdiomListStore = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(getIdiomsList, set),
  reset: () => set({ data: null, error: null, loading: false })
}));

export const useIdiomTonesStore = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(getTones, set)
}));

export const useIdiomTableStore = create((set, get) => ({
  // UI State for IdiomTable
  idiomTableSort: { key: 'text', direction: 'ascending' },
  idiomTableFilter: '',
  idiomTableScroll: 0,
  idiomTableTone: 'all',
  setIdiomTableSort: (sort) => set({ idiomTableSort: sort }),
  setIdiomTableFilter: (filter) => set({ idiomTableFilter: filter }),
  setIdiomTableScroll: (scroll) => set({ idiomTableScroll: scroll }),
  setIdiomTableTone: (tone) => set({ idiomTableTone: tone }),
}));
