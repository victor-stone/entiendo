import { create } from 'zustand';
import { storeFetch } from '../lib/storeUtils';
import reportingService from '../services/reportingService'
const { 
  getReports,
  getReport,
  generateReport
} = reportingService;

export const useReportsStore = create((set, get) => ({
  loading : false,
  error   : null,
  data    : null,
  reset   : () => set({ data: null, error: null, loading: false }),

  fetch   : storeFetch(getReports, set),
  generate: storeFetch(generateReport, set)
}));

export const useReportStore = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(getReport, set),
  reset: () => set({ data: null, error: null, loading: false })
}));

