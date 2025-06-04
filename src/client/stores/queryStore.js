import { ProgressQuery } from '../../shared/lib/query';
import exerciseService from '../services/exerciseService';
import { create } from 'zustand';
import { storeFetch } from '../lib/storeUtils';
const { getDueList } = exerciseService;

export const useProgressQuery = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(getDueList, set, s => s.query = new ProgressQuery(s.data)),
  reset: () => set({ data: null, error: null, loading: false })
}));
