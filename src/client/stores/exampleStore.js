import { create } from 'zustand';
import exampleService from '../services/exampleService';
const { getExample, getExamples, updateExample } = exampleService;
import { storeFetch } from '../lib/storeUtils';

export const useUpdateExampleStore = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  update: storeFetch(updateExample, set),
  reset: () => set({ data: null, error: null, loading: false })
}));

export const useExampleStore = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(getExample, set),
  reset: () => set({ data: null, error: null, loading: false })
}));

export const useExamplesStore = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(getExamples, set),
  reset: () => set({ data: null, error: null, loading: false })
}));

