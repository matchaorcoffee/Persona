import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isGuest: false,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true, isGuest: user.isGuest ?? false }),

      setAccessToken: (accessToken) =>
        set({ accessToken }),

      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false, isGuest: false }),
    }),
    {
      name: 'persona-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
