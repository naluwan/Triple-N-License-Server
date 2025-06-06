'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import CreateCompanyDialog from './_components/createCompanyDialog';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from './_components/companyColumn';
import useCompanies from '@/hooks/useCompanies';

export interface NewCompanyType {
  name: string;
  companyId: string;
  email: string;
  phone: string;
  address: string;
  deployKey: string;
  fingerprints: {
    id: string;
    value: string;
    licenseType: 'subscription' | 'lifetime';
    expiryDate?: Date;
  }[];
}

const DashboardPage = () => {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const authToken = useAuthStore((state) => state.token);
  const { companies, isLoading: companyLoading, mutate } = useCompanies();

  useEffect(() => {
    const localToken = localStorage.getItem('access_token');
    setToken(authToken || localToken);
  }, [authToken]);

  const handleSubmit = async (data: NewCompanyType) => {
    if (!token) {
      toast.error('尚未登入');
      return;
    }

    setIsCreating(true);
    try {
      const res = await axios.post('/api/company', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.status === 200) {
        toast.success(res.data.message);
        setOpen(false);
        mutate();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-semibold'>授權管理</h2>
        <CreateCompanyDialog
          open={open}
          setOpen={setOpen}
          isLoading={isCreating}
          onSubmit={handleSubmit}
        />
      </div>
      <Card>
        <CardContent className='p-6'>
          {companyLoading ? (
            <p>載入中...</p>
          ) : (
            <DataTable data={companies} columns={columns(mutate)} page='0' />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
