import { get, post, put } from "../lib/apiClient";
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

  togglePaused: async(progressId, authToken) => {
    const response = await post(`/api/exercises/pause/${progressId}`, {}, authToken);
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

  resolveAudioVariant: async (exampleId, voiceType, authToken) => {
    const encodedExampleId = encodeURIComponent(exampleId);
    const encodedVoiceType = encodeURIComponent(voiceType);
    return await put(
      `/api/exercises/${encodedExampleId}/audio/${encodedVoiceType}`,
      {},
      authToken
    );
  },

  evaluateResponse: async (
    exampleId,
    userTranscription,
    userTranslation,
    authToken,
    voiceTypeUsed
  ) => {
    const response = await post(
      `/api/exercises/evaluate`,
      {
        exampleId,
        userTranscription,
        userTranslation,
        voiceTypeUsed,
      },
      authToken
    );
    return response;
  },
};

export default exerciseService;
