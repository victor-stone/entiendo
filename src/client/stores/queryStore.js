import { ProgressQuery, IdiomQuery } from '../../shared/lib/query';
import exampleService from '../services/exampleService';
import idiomService from '../services/idiomService';
import { create } from 'zustand';
import { storeFetch } from '../lib/storeUtils';

const { getDueList } = exampleService;
const { getIdioms } = idiomService;

export const useProgressQuery = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(getDueList, set, s => s.query = new ProgressQuery(s.data)),
  reset: () => set({ data: null, error: null, loading: false })
}));

export const useIdiomQuery = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(getIdioms, set, s => s.query = new IdiomQuery(s.data)),
  reset: () => set({ data: null, error: null, loading: false })
}));
