'use client';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import axios from 'axios';
import { ArrowUpDown, LockKeyhole, LockKeyholeOpen } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ViewFingerprintDialog from './viewFingerprintDialog';

export type Fingerprint = {
  value: string;
  registeredAt: string;
  status: 'active' | 'revoked';
};

export type Company = {
  _id: string;
  companyId: string;
  name: string;
  deployKey: string;
  fingerprints: Fingerprint[];
  active: boolean;
  phone: string;
  createdAt: string;
  updatedAt: string;
};

export const columns = (mutate?: () => void): ColumnDef<Company>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='p-0'
        >
          名稱
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const company = row.original;
      return (
        <Link href={`/company/${company._id}`}>
          <p>{company.name}</p>
        </Link>
      );
    },
  },
  {
    accessorKey: 'phone',
    header: '電話',
  },
  {
    accessorKey: 'fingerprint-dialog',
    header: '授權設備',
    cell: ({ row }) => {
      const company = row.original;
      return (
        <ViewFingerprintDialog
          companyId={company._id}
          fingerprints={company.fingerprints}
          mutate={mutate}
        />
      );
    },
  },
  {
    accessorKey: 'lock-action',
    header: '鎖定/解鎖',
    cell: ({ row }) => {
      const company = row.original;

      const setLock = async () => {
        try {
          const data = { _id: company._id, active: company.active };
          const res = await axios.put('/api/company/active', data);

          if (res.data.status === 200) {
            toast.success(res.data.message);
            if (mutate) mutate();
          } else {
            toast.error(res.data.message);
          }
        } catch (err) {
          toast.error('發生錯誤，請稍後再操作');
        }
      };
      return (
        <Button
          variant='ghost'
          className='flex justify-start transition-all duration-300 hover:scale-125 hover:bg-transparent'
          onClick={setLock}
        >
          {company.active ? (
            <LockKeyhole className='h-4 w-4 text-green-500' />
          ) : (
            <LockKeyholeOpen className='h-4 w-4 text-red-600' />
          )}
        </Button>
      );
    },
  },
];
