import { Idioms } from '../queries';
import idiomService from '../services/idiomService';
import { create } from 'zustand';
import { storeFetch } from '../lib/storeUtils';

const { getIdioms } = idiomService;

export const useIdiomQuery = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(getIdioms, set, s => s.query = new Idioms(s.data)),
  reset: () => set({ data: null, error: null, loading: false })
}));
