import { get, postFile } from "../lib/apiClient";

const exampleService = {

  getExamples: async (idiomId, authToken) => {
    return await get(`/api/example/idiom/${idiomId}`, authToken);
  },

  getExample: async (exampleId, authToken) => {
    return await get(`/api/example/${exampleId}`, authToken);
  },

  updateExample: async (exampleId, data, audioFile, token) => {
    // postFile(url, file, additionalData = {}, authToken = null) {
    return await postFile(`/api/example/${exampleId}`, audioFile, data, token);
  },

};

export default exampleService;
