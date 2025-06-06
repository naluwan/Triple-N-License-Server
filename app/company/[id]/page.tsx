'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import useAuthStore from '@/store/authStore';
import useCompanyStore from '@/store/companyStore';
import { FingerprintType } from '@/models/Company';

const formSchema = z.object({
  name: z.string().min(1, '公司名稱必填'),
  companyId: z.string().min(1, '公司統編必填'),
  email: z.string().email('Email格式錯誤'),
  phone: z.string().min(1, '電話必填'),
  address: z.string().min(1, '地址必填'),
  deployKey: z.string().min(1, '部署金鑰必填'),
});

type FormValues = z.infer<typeof formSchema>;

const CompanyPage = () => {
  const params = useParams<{ id: string }>();
  const editCompany = useCompanyStore((state) => state.editCompany);
  const token =
    useAuthStore((state) => state.token) ||
    (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fingerprints, setFingerprints] = useState<FingerprintType[]>([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState('');
  const [lastUpdatedBy, setLastUpdatedBy] = useState('');

  useEffect(() => {
    const fetchCompany = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`/api/company/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.status === 200) {
          const c = res.data.company;
          setFingerprints(c.fingerprints || []);
          setLastUpdatedAt(c.updatedAt);
          setLastUpdatedBy(c.updatedBy?.name || '');
          reset({
            name: c.name,
            companyId: c.companyId,
            email: c.email,
            phone: c.phone,
            address: c.address,
            deployKey: c.deployKey,
          });
        } else {
          toast.error(res.data.message);
        }
      } catch (err) {
        toast.error('資料載入失敗');
      }
    };
    fetchCompany();
  }, [params.id, token, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      toast.error('尚未登入');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.put(`/api/company/${params.id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === 200) {
        toast.success(res.data.message);
        editCompany(res.data.company);
        setLastUpdatedAt(res.data.company.updatedAt);
        setLastUpdatedBy(res.data.company.updatedBy?.name || '');
        setEditing(false);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('更新失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-semibold'>公司資訊</h2>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>編輯</Button>
        ) : (
          <div className='flex gap-2'>
            <Button onClick={handleSubmit(onSubmit)} disabled={loading}>
              {loading ? '儲存中...' : '儲存'}
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                setEditing(false);
              }}
            >
              取消
            </Button>
          </div>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>基本資料</CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <InputBlock
            id='name'
            label='公司名稱'
            register={register}
            error={errors.name}
            disabled={!editing}
          />
          <InputBlock
            id='companyId'
            label='公司統編'
            register={register}
            error={errors.companyId}
            disabled={!editing}
          />
          <InputBlock
            id='email'
            label='公司 Email'
            register={register}
            error={errors.email}
            disabled={!editing}
          />
          <InputBlock
            id='phone'
            label='電話'
            register={register}
            error={errors.phone}
            disabled={!editing}
          />
          <InputBlock
            id='deployKey'
            label='部署金鑰'
            register={register}
            error={errors.deployKey}
            disabled={!editing}
          />
          <div className='flex flex-col gap-1 md:col-span-2'>
            <Label htmlFor='address'>
              公司地址 <span className='text-red-500'>*</span>
            </Label>
            <Textarea
              id='address'
              {...register('address')}
              className='resize-none'
              disabled={!editing}
            />
            {errors.address && (
              <p className='text-sm text-red-500'>{errors.address.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className='flex justify-end'>
          {lastUpdatedAt && (
            <p className='text-xs text-muted-foreground'>
              最後更新：{new Date(lastUpdatedAt).toLocaleString()} {lastUpdatedBy && `by ${lastUpdatedBy}`}
            </p>
          )}
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>授權設備</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          {fingerprints.length === 0 ? (
            <p className='text-muted-foreground text-sm'>尚無授權設備</p>
          ) : (
            fingerprints.map((fp, idx) => (
              <div key={idx} className='rounded-md border p-3 text-sm shadow-sm'>
                <p className='break-all font-mono text-xs'>
                  <strong>設備ID：</strong> {fp.value}
                </p>
                <p className='text-xs'>
                  授權類型：{fp.licenseType === 'subscription' ? '訂閱制' : '買斷制'}
                </p>
                <p
                  className={`text-xs font-medium ${
                    fp.status === 'active' ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  狀態：{fp.status === 'active' ? '啟用' : '停用'}
                </p>
                {fp.licenseType === 'subscription' && fp.expiryDate && (
                  <p className='text-xs'>
                    到期日：{new Date(fp.expiryDate).toLocaleDateString()}
                  </p>
                )}
                <p className='text-muted-foreground text-xs'>
                  註冊時間：{new Date(fp.registeredAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface InputBlockProps {
  id: keyof FormValues;
  label: string;
  register: ReturnType<typeof useForm<FormValues>>['register'];
  error?: { message?: string };
  disabled: boolean;
}

const InputBlock = ({ id, label, register, error, disabled }: InputBlockProps) => (
  <div className='flex flex-col gap-1'>
    <Label htmlFor={id}>
      {label} <span className='text-red-500'>*</span>
    </Label>
    <Input id={id} {...register(id)} disabled={disabled} />
    {error?.message && <p className='text-sm text-red-500'>{error.message}</p>}
  </div>
);

export default CompanyPage;
