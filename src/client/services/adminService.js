import { get, post, postFile } from "../lib/apiClient";
import debug from "debug";

const debugAdmin = debug("app:admin");

const adminService = {
  createIdiom: async (idiomData, authToken) => {
    return await post("/api/admin/idiom", idiomData, authToken);
  },

  updateIdiom: async (idiomId, idiomData, authToken) => {
    const data = { idiomId, ...idiomData };
    return await post("/api/admin/idiom/update", data, authToken);
  },

  createExample: async (exampleData, authToken) => {
    return await post("/api/admin/idiom-examples", exampleData, authToken);
  },

  uploadExampleAudio: async (exampleId, audioFile, authToken) => {
    return await postFile(
      "/api/admin/example-audio",
      audioFile,
      { exampleId },
      authToken
    );
  },

  /*(((((((((((((((())))))))))))))))
           AI PROMPTS
    (((((((((((((((())))))))))))))))                 
  */
  prompts: async (authToken) => {
    return await get("/api/admin/prompts", authToken);
  },

  putPrompts: async (prompts, authToken) => {
    return await post("/api/admin/prompts", { prompts }, authToken);
  },

  /*(((((((((((((((())))))))))))))))
                 EDITOR
    (((((((((((((((())))))))))))))))                 
  */
  assignmentReports: async (specs, authToken) => {
    return await post("/api/editor/assignmentreports", specs, authToken);
  },

  assignIdiom: async (idiomId, source, authToken) => {
    return await post(
      "/api/editor/assign",
      { idiomId, source },
      authToken
    );
  },

  assignFulfill: async (args, audioFile, authToken) => {
    return await postFile(
      "/api/editor/fulfill",
      audioFile,
      args,
      authToken
    );
  },

  assignPublish: async (idiomId, assign, authToken) => {
    return await post(
      "/api/editor/publish",
      { idiomId, assign },
      authToken
    );
  },

  editors: async (authToken) => {
    return await get("api/editors", authToken);
  },


  /*(((((((((((((((())))))))))))))))
                IMPORT
    (((((((((((((((())))))))))))))))                 
  */
  validateIdiomsFromCSV: async (file, authToken) => {
    /**
        returns:
        {
          idioms,
          errors,
          duplicates,
          totalRecords
        }
      */
    return await postFile("/api/admin/idioms/validate", file, {}, authToken);
  },

  importIdioms: async (idioms, authToken) => {
    return await post("/api/admin/idioms", { idioms }, authToken);
  },


  /*(((((((((((((((())))))))))))))))
              HOUSEKEEPING
    (((((((((((((((())))))))))))))))                 
  */
  resetCaches: async (authToken) => {
    return await get("/api/admin/resetcaches", authToken);
  },


  /*(((((((((((((((())))))))))))))))
                 BUGS
    (((((((((((((((())))))))))))))))                 
  */
  reportBug: async (title, body, labels, authToken) => {
    return await post(
      "/api/admin/reportbug",
      { title, body, labels },
      authToken
    );
  },
};

export default adminService;
