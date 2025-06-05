'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';

const HomePage = () => {
  const router = useRouter();
  const { token, setToken } = useAuthStore();

  useEffect(() => {
    const savedToken = token || localStorage.getItem('access_token');

    if (savedToken) {
      if (!token) setToken(savedToken);
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router, token, setToken]);

  return null;
};

export default HomePage;
