'use client';
import useSWR from 'swr';
import axios from 'axios';
import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import useCompanyStore from '@/store/companyStore';
import toast from 'react-hot-toast';

const fetcher = (url: string, token: string) =>
  axios
    .get(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);

const useCompanies = () => {
  const token =
    useAuthStore((state) => state.token) ||
    (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
  const logout = useAuthStore((state) => state.logout);
  const setCompanies = useCompanyStore((state) => state.setCompanies);
  const companies = useCompanyStore((state) => state.companies);

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
      toast.error(error?.response?.data.message);
    }
  }, [error]);

  return { companies, mutate, isLoading };
};

export default useCompanies;
