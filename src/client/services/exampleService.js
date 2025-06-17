import { get, post } from "../lib/apiClient";
import debug from 'debug';

const debugExercise = debug('app:exercise');

/**
 * Service for interacting with the Exercise API
 */
const exampleService = {
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
  getExamples: async (idiomId) => {
    return await get(`/api/exercises/${idiomId}`);
  },

  getExample: async (exampleId) => {
    return await get(`/api/exercises/example/${exampleId}`);
  },

  updateExample: async (exampleId, data, token) => {
    return await post(`/api/exercises/example/${exampleId}`, data, token);
  },

  // TODO: below should be exerciseService
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
    debugExercise('Fetching next %s', url)
    const response = await get(url, authToken);
    return response;
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

export default exampleService;
