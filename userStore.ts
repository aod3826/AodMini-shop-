import { create } from 'zustand';
import { Profile } from '../types';

interface UserState {
  user: Profile | null;
  isLoading: boolean;
  setUser: (user: Profile | null) => void;
  setLoading: (isLoading: boolean) => void;
  isAdmin: () => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  isAdmin: () => get().user?.role === 'admin',
}));
