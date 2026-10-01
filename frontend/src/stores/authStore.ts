import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  playerId: string;
  playerName: string;
  role: 'player' | 'admin' | 'moderator';
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (playerName: string, password: string) => Promise<void>;
  register: (playerName: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  verifyToken: () => Promise<boolean>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (playerName: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerName, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Login failed');
          }

          set({
            user: data.player,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });

          localStorage.setItem('authToken', data.token);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (playerName: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerName, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
          }

          set({
            user: data.player,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });

          localStorage.setItem('authToken', data.token);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('authToken');
      },

      refreshToken: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const response = await fetch(`${API_BASE}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (response.ok && data.token) {
            set({ token: data.token });
            localStorage.setItem('authToken', data.token);
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      },

      verifyToken: async () => {
        const { token } = get();
        if (!token) return false;

        try {
          const response = await fetch(`${API_BASE}/api/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (data.valid && data.user) {
            set({
              user: data.user,
              isAuthenticated: true,
            });
            return true;
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            });
            return false;
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
