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

export const useListingStore = create((set, get) => ({
  // UI State for Listing
  listingSort         : { key: 'text', direction: 'ascending' },
  listingTextFilter   : '',
  listingTone         : 'all',
  listingUsage        : 'all',
  listingPending      : false,
  listingVoice        : '',

  setListingSort      : (sort)   => set({ listingSort: sort }),
  setListingUsage     : (usage)  => set({ listingUsage: usage }),
  setListingTextFilter: (filter) => set({ listingTextFilter: filter }),
  setListingTone      : (tone)   => set({ listingTone: tone }),
  setListingPending   : (pending)=> set({ listingPending: pending }),
  setListingVoice     : (voice)  => set({ listingVoice: voice })
}));
