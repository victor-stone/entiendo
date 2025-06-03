async function _swapOutToken(args) {
  if (args.length > 0 && typeof args[args.length - 1] === 'function') {
    const getToken = args[args.length - 1];
    args[args.length - 1] = await getToken();
  }
  return args;
}

export const storeFetch = (fetcher, set) => async (...args) => {
    set({loading: true, error: null, data: null });
    try {
      args = await _swapOutToken(args);
      const data = await fetcher.apply(null,args);
      set({ data, loading: false})
      return data;
    } catch(err) {
      set({ error: err.message, loading: false })
      return null;
    }
  };
