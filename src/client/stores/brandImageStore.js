import { create } from 'zustand';

export const useBrandImageStore = create(set => ({
  image: 'logo',
  setImage: (image) => set({ image })
}));


