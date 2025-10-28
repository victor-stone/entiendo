import { create } from 'zustand';
import { storeFetch } from '../lib/storeUtils';
import adminService from '../services/adminService'
const { assignFulfill, assignIdiom, homeworkReports, 
  homeworkPublish, editors } = adminService;

export const useAssignPublishStore = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  publish: storeFetch(homeworkPublish, set),
  reset: () => set({ data: null, error: null, loading: false })
}));

export const useAssignIdiomStore = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  assign: storeFetch(assignIdiom, set),
  reset: () => set({ data: null, error: null, loading: false })
}));

export const useEditorsStore = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fetch: storeFetch(editors, set),
  reset: () => set({ data: null, error: null, loading: false })
}));

export const useAssignmentFulfillStore = create((set, get) => ({
  loading: false,
  error: null,
  data: null,
  fulfill: storeFetch(assignFulfill, set),
  reset: () => set({ data: null, error: null, loading: false })
}));

export const useAssignmentReportsStore = create((set, get) => ({
  reportName: '',
  setReportName: reportName => set({reportName}),
  loading: false,
  error: null,
  data: null,
  patchData: idiom => {
    const data = get().data;
    for( let i = 0; i < data.length; i++ ) {
      if( data[i].idiomId == idiom.idiomId ) {
        data[i].homework = { ...idiom.homework };
        break;
      }
    }
    set({ data })
  },
  fetch: storeFetch(homeworkReports, set),
  reset: () => set({ data: null, error: null, loading: false })
}));
