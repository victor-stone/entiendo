import { get, post } from "../lib/apiClient";
import debug from "debug";

const debugExercise = debug("app:exercise");

const exerciseService = {
  getScheduleStats: async (authToken) => {
    const response = await get("/api/exercises/stats", authToken);
    return response;
  },

  getSchedule: async (authToken) => {
    const response = await get("/api/exercises", authToken);
    return response;
  },

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
    debugExercise("Fetching next %s", url);
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

export default exerciseService;
