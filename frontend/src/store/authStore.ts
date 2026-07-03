import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';
import { setAccessToken } from '../utils/token';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  lastValidated: number | null;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setLastValidated: (timestamp: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      lastValidated: null,
      login: (user, token) => {
        setAccessToken(token);
        set({ user, isAuthenticated: true, lastValidated: Date.now() });
      },
      logout: async () => {
        try {
          // Revoke refresh token on the backend and clear the httpOnly cookie
          await api.post('/auth/logout');
        } catch {
          // Even if the backend call fails, still clear local state
        }
        setAccessToken(null);
        set({ user: null, isAuthenticated: false, lastValidated: null });
      },
      setUser: (user) => {
        set({ user, isAuthenticated: true, lastValidated: Date.now() });
      },
      setLastValidated: (timestamp) => {
        set({ lastValidated: timestamp });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastValidated: state.lastValidated,
      }),
    }
  )
);
