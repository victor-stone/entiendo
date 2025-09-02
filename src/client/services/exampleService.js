import { get, postFile } from "../lib/apiClient";

const exampleService = {

  getExamples: async (idiomId) => {
    return await get(`/api/example/idiom/${idiomId}`);
  },

  getExample: async (exampleId) => {
    return await get(`/api/example/${exampleId}`);
  },

  updateExample: async (exampleId, data, audioFile, token) => {
    // postFile(url, file, additionalData = {}, authToken = null) {
    return await postFile(`/api/example/${exampleId}`, audioFile, data, token);
  },

};

export default exampleService;
