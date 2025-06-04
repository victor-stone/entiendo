
async function _swapFuncForToken(args) {
  if (args.length > 0 && typeof args[args.length - 1] === 'function') {
    const getToken = args[args.length - 1];
    args[args.length - 1] = await getToken();
  }
  return args;
}

export const storeFetch = (fetcher, set, hook) => async (...args) => {
    set({loading: true, error: null, data: null });
    try {
      args = await _swapFuncForToken(args);
      const data = await fetcher.apply(null,args);
      const setData = { data, loading: false};
      if( hook ) hook(setData);
      set(setData);
      return data;
    } catch(err) {
      set({ error: err.message, loading: false })
      return null;
    }
  };
