import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: { email: string } | null;
  setToken: (token: string) => void;
  setUser: (user: { email: string }) => void;
  logout: (msg?: string) => void;
}

const useAuthStore = create<AuthState>((set) => {
  return {
    token: null,
    user: null,
    setToken: (token) => set({ token }),
    setUser: (user) => set({ user }),
    logout: (msg = '登出成功') => {
      localStorage.removeItem('access_token');
      localStorage.setItem('logoutMsg', msg);
      set({ token: null, user: null });
      window.location.href = '/login';
    },
  };
});

export default useAuthStore;
