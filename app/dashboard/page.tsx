'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import CreateCompanyDialog from './_components/createCompanyDialog';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';

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
  const [isLoading, setIsLoading] = useState(false);

  // const [newCompany, setNewCompany] = useState<NewCompanyType>({
  //   name: '',
  //   companyId: '',
  //   email: '',
  //   phone: '',
  //   address: '',
  //   deployKey: '',
  //   fingerprints: [
  //     {
  //       id: uuidv4(),
  //       value: '',
  //       licenseType: 'lifetime',
  //       expiryDate: new Date(),
  //     },
  //   ],
  //   active: true,
  // });

  const token = useAuthStore((state) => state.token);

  // const updateNewCompany = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  // ) => {
  //   const { name, value } = e.target;
  //   setNewCompany((prev) => ({ ...prev, [name]: value }));
  // };

  // const updateFingerprints = (
  //   newList: {
  //     id: string;
  //     value: string;
  //     licenseType: 'subscription' | 'lifetime';
  //     expiryDate?: Date;
  //   }[],
  // ) => {
  //   setNewCompany((prev) => ({
  //     ...prev,
  //     fingerprints: newList,
  //   }));
  // };

  // const resetCompany = () => {
  //   setNewCompany({
  //     name: '',
  //     companyId: '',
  //     email: '',
  //     phone: '',
  //     address: '',
  //     deployKey: '',
  //     fingerprints: [
  //       {
  //         id: uuidv4(),
  //         value: '',
  //         licenseType: 'lifetime',
  //         expiryDate: new Date(),
  //       },
  //     ],
  //     active: true,
  //   });
  // };

  const handleSubmit = async (data: NewCompanyType) => {
    setIsLoading(true);
    try {
      const res = await axios.post('/api/company', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.status === 200) {
        toast.success(res.data.message);
        setOpen(false);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-semibold'>授權管理</h2>
        <CreateCompanyDialog
          open={open}
          setOpen={setOpen}
          isLoading={isLoading}
          atSubmit={handleSubmit}
        />
      </div>
      <Card>
        <CardContent className='p-6'>
          <div>這裡是 Data Table 的位置</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
