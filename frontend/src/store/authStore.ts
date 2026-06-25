import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user, token) => {
        localStorage.setItem('accessToken', token);
        set({ user, isAuthenticated: true });
      },
      logout: async () => {
        try {
          // Revoke refresh token on the backend and clear the httpOnly cookie
          await api.post('/auth/logout');
        } catch {
          // Even if the backend call fails, still clear local state
        }
        localStorage.removeItem('accessToken');
        set({ user: null, isAuthenticated: false });
      },
      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
