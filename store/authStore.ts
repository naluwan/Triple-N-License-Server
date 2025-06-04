import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: { email: string } | null;
  setToken: (token: string) => void;
  setUser: (user: { email: string }) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  logout: () => set({ token: null, user: null }),
}));

export default useAuthStore;
