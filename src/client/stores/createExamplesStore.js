import { create } from 'zustand';

export function createExamplesStore(fetchExamples) {
  if (typeof fetchExamples !== 'function') {
    throw new TypeError('fetchExamples must be a function');
  }

  let latestRequest = 0;

  return create((set) => ({
    loading: false,
    error: null,
    data: null,
    idiomId: null,
    fetch: async (idiomId, authToken) => {
      const request = ++latestRequest;
      set({
        loading: true,
        error: null,
        data: null,
        idiomId,
      });

      try {
        const token = typeof authToken === 'function'
          ? await authToken()
          : authToken;
        const data = await fetchExamples(idiomId, token);
        if (request === latestRequest) {
          set({ data, loading: false });
        }
        return data;
      } catch (error) {
        if (request === latestRequest) {
          set({
            error: error.message || 'Failed to load examples',
            loading: false,
          });
        }
        return null;
      }
    },
    reset: () => {
      latestRequest += 1;
      set({
        data: null,
        error: null,
        loading: false,
        idiomId: null,
      });
    },
  }));
}
