import { get, post } from "../lib/apiClient";

const exampleService = {

  getExamples: async (idiomId) => {
    return await get(`/api/example/idiom/${idiomId}`);
  },

  getExample: async (exampleId) => {
    return await get(`/api/example/${exampleId}`);
  },

  updateExample: async (exampleId, data, token) => {
    return await post(`/api/example/${exampleId}`, data, token);
  },

};

export default exampleService;
