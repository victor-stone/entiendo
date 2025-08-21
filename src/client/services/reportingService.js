import { get } from "../lib/apiClient";

const reportingService = {

  getReports: async (token) => {
    return await get(`/api/reports`, token);
  },

  getReport: async (reportId, token) => {
    return await get(`/api/report/${reportId}`, token);
  },

  generateReport: async (token) => {
    return await get('/api/report/generate', token);
  },

};

export default reportingService;
