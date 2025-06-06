'use client';
import useSWR from 'swr';
import axios from 'axios';
import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import useCompanyStore from '@/store/companyStore';

const fetcher = (url: string, token: string) =>
  axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.data);

const useCompanies = () => {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const setCompanies = useCompanyStore((state) => state.setCompanies);

  const { data, error, mutate, isLoading } = useSWR(
    token ? ['/api/company', token] : null,
    ([url, t]) => fetcher(url, t),
  );

  useEffect(() => {
    if (data) {
      if (data.status === 200) {
        setCompanies(data.companies);
      } else if (data.status === 401 || data.status === 403) {
        logout('請重新登入');
      }
    }
  }, [data, setCompanies, logout]);

  useEffect(() => {
    if (error) {
      logout('請重新登入');
    }
  }, [error, logout]);

  return { companies: data?.companies || [], mutate, isLoading };
};

export default useCompanies;
