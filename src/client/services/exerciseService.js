import { get, post } from "../lib/apiClient";

/**
 * Service for interacting with the Exercise API
 */
const exerciseService = {
  getNext: async (criteria, authToken) => {
    const params = new URLSearchParams();

    // Add each criteria property as an individual query parameter
    Object.entries(criteria).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const url = `/api/exercises/next${queryString ? `?${queryString}` : ""}`;

    const response = await get(url, authToken);
    return response;
  },

  getDueList: async (authToken) => {
    const response = await get("/api/exercises", authToken);
    return response;
  },

  getDueStats: async (authToken) => {
    const response = await get("/api/exercises/stats", authToken);
    return response;
  },

    /**
   * Get examples for a specific idiom
   * @param {String} idiomId - ID of the idiom
   * @returns {Promise<Array>} - List of examples for the idiom
   */
  getIdiomExamples: async (idiomId) => {
    return await get(`/api/exercises/${idiomId}`);
  },

  getExample: async (exerciseid) => {
    return await get(`/api/exercises/example/${exerciseid}`);
  },

  evaluateResponse: async (
    exampleId,
    userTranscription,
    userTranslation,
    authToken
  ) => {
    const response = await post(
      `/api/exercises/evaluate`,
      {
        exampleId,
        userTranscription,
        userTranslation,
      },
      authToken
    );
    return response;
  },
};

export default exerciseService;
