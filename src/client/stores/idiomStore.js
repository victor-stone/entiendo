import { create } from 'zustand';
import idiomService from '../services/idiomService';
import { storeFetch } from '../lib/storeUtils';
const { getIdiom, getIdiomsList, 
  getTones, getNormals, getNormal } = idiomService;

export const useIdiomStore = create((set, get) => ({
  loading: false,
  error  : null,
  data   : null,
  fetch  : storeFetch(getIdiom, set),
  reset  : () => set({ data: null, error: null, loading: false })
}));

export const useIdiomListStore = create((set, get) => ({
  loading   : false,
  error     : null,
  data      : null,
  insertData: idiom => {
    const data = get().data;
    data.push(idiom);
    set({ data })
  },
  fetch: storeFetch(getIdiomsList, set),
  reset: () => set({ data: null, error: null, loading: false })
}));

export const useIdiomTonesStore = create((set, get) => ({
  loading: false,
  error  : null,
  data   : null,
  fetch  : storeFetch(getTones, set)
}));

export const useIdiomNormalsStore = create((set, get) => ({
  loading: false,
  error  : null,
  data   : null,
  fetch  : storeFetch(getNormals, set)
}));

export const useIdiomNormalStore = create((set, get) => ({
  loading: false,
  error  : null,
  data   : null,
  reset: () => set({ data: null, error: null, loading: false }),
  fetch  : storeFetch(getNormal, set)
}));
