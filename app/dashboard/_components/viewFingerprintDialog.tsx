'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import DatePicker from '@/components/datePicker/datePicker';
import { Monitor, LoaderCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import useCompanyStore from '@/store/companyStore';

export type Fingerprint = {
  value: string;
  registeredAt: string;
  licenseType: 'subscription' | 'lifetime';
  expiryDate?: string | null;
  status: 'active' | 'revoked';
};

const fingerprintSchema = z.object({
  value: z.string().min(1, '設備ID 必填'),
  licenseType: z.enum(['subscription', 'lifetime']),
  expiryDate: z.date().optional(),
  status: z.enum(['active', 'revoked']),
});

const formSchema = z.object({
  fingerprints: z.array(fingerprintSchema).min(1, '至少一筆設備授權'),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  companyId: string;
  fingerprints: Fingerprint[];
  mutate?: () => void;
}

const ViewFingerprintDialog = ({ companyId, fingerprints, mutate }: Props) => {
  const token =
    useAuthStore((state) => state.token) ||
    (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
  const editCompany = useCompanyStore((state) => state.editCompany);

  const defaultValues: FormValues = {
    fingerprints: fingerprints.map((fp) => ({
      value: fp.value,
      licenseType: fp.licenseType,
      expiryDate: fp.expiryDate ? new Date(fp.expiryDate) : new Date(),
      status: fp.status,
    })),
  };

  const { register, control, handleSubmit, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields, append } = useFieldArray({ control, name: 'fingerprints' });

  const [isSaving, setIsSaving] = useState(false);
  const [dateOpenMap, setDateOpenMap] = useState<Record<string, boolean>>({});

  const watchFingerprints = watch('fingerprints');

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      toast.error('尚未登入');
      return;
    }

    setIsSaving(true);
    try {
      const res = await axios.put(
        `/api/company/${companyId}`,
        {
          fingerprints: data.fingerprints.map((fp) => ({
            value: fp.value,
            licenseType: fp.licenseType,
            expiryDate: fp.licenseType === 'subscription' ? fp.expiryDate : null,
            status: fp.status,
          })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.status === 200) {
        toast.success(res.data.message);
        editCompany(res.data.company);
        if (mutate) mutate();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('操作失敗，請稍後再試');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (value: string, currentStatus: 'active' | 'revoked') => {
    try {
      const res = await axios.put(`/api/company/${companyId}`, {
        fingerprints: [
          { value, status: currentStatus === 'active' ? 'revoked' : 'active' },
        ],
      });
      if (res.data.status === 200) {
        toast.success(res.data.message);
        editCompany(res.data.company);
        if (mutate) mutate();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('操作失敗，請稍後再試');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='ghost' className='flex items-center gap-1'>
          <Monitor className='h-4 w-4' /> 查看
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>授權設備列表</DialogTitle>
          <DialogDescription>查看與管理此公司已註冊的設備</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {fields.map((field, index) => {
            const currentLicenseType = watchFingerprints?.[index]?.licenseType;
            const fpStatus = watchFingerprints?.[index]?.status;
            return (
              <div
                key={field.id}
                className='space-y-2 rounded-md border p-3 text-sm shadow-sm'
              >
                <Input
                  {...register(`fingerprints.${index}.value`)}
                  placeholder='設備ID'
                />
                <Controller
                  control={control}
                  name={`fingerprints.${index}.licenseType`}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.id}
                      onValueChange={field.onChange}
                      className='flex gap-4'
                    >
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='subscription' id={`sub-${field.id}`} />
                        <label htmlFor={`sub-${field.id}`}>訂閱制</label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='lifetime' id={`life-${field.id}`} />
                        <label htmlFor={`life-${field.id}`}>買斷制</label>
                      </div>
                    </RadioGroup>
                  )}
                />
                {currentLicenseType === 'subscription' && (
                  <Controller
                    control={control}
                    name={`fingerprints.${index}.expiryDate`}
                    render={({ field }) => (
                      <DatePicker
                        defaultDate={field.value}
                        updateDate={field.onChange}
                        openDatePicker={dateOpenMap[field.id] || false}
                        setOpenDatePicker={(open) =>
                          setDateOpenMap((prev) => ({ ...prev, [field.id]: open }))
                        }
                      />
                    )}
                  />
                )}
                <div className='flex items-center justify-between pt-1'>
                  <p
                    className={`text-xs font-medium ${
                      fpStatus === 'active' ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    狀態：{fpStatus === 'active' ? '啟用中' : '停用'}
                  </p>
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    className='h-6 text-xs'
                    onClick={() => toggleStatus(field.value, fpStatus)}
                  >
                    {fpStatus === 'active' ? '撤銷' : '啟用'}
                  </Button>
                </div>
              </div>
            );
          })}
          <Button
            type='button'
            variant='outline'
            onClick={() =>
              append({
                value: '',
                licenseType: 'lifetime',
                expiryDate: new Date(),
                status: 'active',
              })
            }
          >
            新增設備
          </Button>
          <DialogFooter>
            <Button type='submit' disabled={isSaving}>
              {isSaving ? (
                <span className='flex items-center gap-2'>
                  <LoaderCircle className='h-4 w-4 animate-spin' /> 儲存中...
                </span>
              ) : (
                '儲存'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ViewFingerprintDialog;
