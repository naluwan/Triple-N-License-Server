import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: { email: string } | null;
  setToken: (token: string) => void;
  setUser: (user: { email: string }) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => {
  return {
    token: null,
    user: null,
    setToken: (token) => set({ token }),
    setUser: (user) => set({ user }),
    logout: () => {
      localStorage.removeItem('TRIPLE_N_ERP_JWT_TOKEN');
      localStorage.setItem('logoutMsg', '登出成功');
      set({ token: null, user: null });
      window.location.href = '/login';
    },
  };
});

export default useAuthStore;
