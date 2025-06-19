import { ProgressQuery, IdiomQuery } from '../../shared/lib/query';
import exerciseService from '../services/exerciseService';
import idiomService from '../services/idiomService';
import { create } from 'zustand';
import { storeFetch } from '../lib/storeUtils';

const { getSchedule } = exerciseService;
const { getIdioms } = idiomService;

export const useProgressQuery = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(getSchedule, set, s => s.query = new ProgressQuery(s.data)),
  reset: () => set({ data: null, error: null, loading: false })
}));

export const useIdiomQuery = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(getIdioms, set, s => s.query = new IdiomQuery(s.data)),
  reset: () => set({ data: null, error: null, loading: false })
}));
