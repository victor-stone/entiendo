import { create } from 'zustand';

export const useBrandImageStore = create(set => ({
  image: 'candle',
  setImage: (image) => set({ image })
}));


