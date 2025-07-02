import { get, post, postFile } from "../lib/apiClient";
import debug from "debug";

const debugAdmin = debug("client:admin");

/**
 * Service for admin-related API operations
 */
const adminService = {

  resetCaches: async (authToken) => {
    return await get("/api/admin/resetcaches", authToken);
  },
  
  createIdiom: async (idiomData, authToken) => {
    return await post("/api/admin/idiom", idiomData, authToken);
  },

  assignIdiom: async (idiomId, source, authToken) => {
    return await post("/api/admin/assignidiom", {idiomId, source}, authToken);
  },

  updateIdiom: async (idiomId, idiomData, authToken) => {
    const data = { idiomId, ...idiomData };
    return await post("/api/admin/idiom/update", data, authToken);
  },

  createExample: async (exampleData, authToken) => {
    return await post("/api/admin/idiom-examples", exampleData, authToken);
  },

  prompts: async (authToken) => {
    return await get("/api/admin/prompts", authToken);
  },

  putPrompts: async (prompts, authToken) => {
    return await post("/api/admin/prompts", { prompts }, authToken);
  },

  audioReports: async ( specs, authToken ) => {
    return await post('/api/admin/audioreports', specs, authToken)
  },

  uploadExampleAudio: async (exampleId, audioFile, authToken) => {
    return await postFile(
      "/api/admin/example-audio",
      audioFile,
      { exampleId },
      authToken
    );
  },

  /**
   * returns:
  *  {
       idioms,
       errors,
       duplicates,
       totalRecords
     }
  */
  validateIdiomsFromCSV: async (file, authToken) => {
    return await postFile("/api/admin/idioms/validate", file, {}, authToken);
  },

  /**
   * Batch create multiple idioms
   * @param {Array} idioms - Array of idiom objects to create
   * @param {String} authToken - Authentication token
   * @returns {Promise<Object>} - Results of batch creation
   */
  importIdioms: async (idioms, authToken) => {
    return await post("/api/admin/idioms", { idioms }, authToken);
  },

  reportBug: async (title, body, labels, authToken) => {
    return await post(
      "/api/admin/reportbug",
      { title, body, labels },
      authToken
    );
  },
};

export default adminService;
