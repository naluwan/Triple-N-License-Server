// ✅ 統整後：保留 react-hook-form + zod，修正 radioGroup 選取問題並讓訂閱制顯示日期選擇器（修正 useWatch 錯誤）
'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import DatePicker from '@/components/datePicker/datePicker';
import { LoaderCircle } from 'lucide-react';

const fingerprintSchema = z.object({
  id: z.string(),
  value: z.string().min(1, '設備ID 必填'),
  licenseType: z.enum(['subscription', 'lifetime']),
  expiryDate: z.date().optional(),
});

const formSchema = z.object({
  name: z.string().min(1, '公司名稱必填'),
  companyId: z.string().min(1, '公司統編必填'),
  email: z.string().email('Email格式錯誤'),
  phone: z.string().min(1, '電話必填'),
  address: z.string().min(1, '地址必填'),
  deployKey: z.string().min(1, '部署金鑰必填'),
  fingerprints: z.array(fingerprintSchema).min(1, '至少一筆設備授權'),
});

export type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  isLoading: boolean;
  onSubmit: (data: FormValues) => void;
}

const CreateCompanyDialog = ({ open, setOpen, isLoading, onSubmit }: Props) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      companyId: '',
      email: '',
      phone: '',
      address: '',
      deployKey: '',
      fingerprints: [
        {
          id: uuidv4(),
          value: '',
          licenseType: 'lifetime',
          expiryDate: new Date(),
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fingerprints',
  });

  const [dateOpenMap, setDateOpenMap] = useState<Record<string, boolean>>({});

  const watchFingerprints = watch('fingerprints');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='default' className='w-full sm:w-auto'>
          註冊公司授權
        </Button>
      </DialogTrigger>
      <DialogContent
        className='hide-scrollbar max-h-[90%] max-w-[90%] overflow-y-scroll'
        onInteractOutside={() => reset()}
      >
        <DialogHeader>
          <DialogTitle>公司授權資料</DialogTitle>
          <DialogDescription>
            請填寫以下公司授權相關資料 (<span className='text-red-500'>*</span> 為必填)
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className='flex h-[200px] w-full items-center justify-center'>
            <LoaderCircle className='mr-3 h-5 w-5 animate-spin' />
            <p>建立中，請稍候...</p>
          </div>
        ) : (
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
              />
              <InputBlock
                id='companyId'
                label='公司統編'
                register={register}
                error={errors.companyId}
              />
              <InputBlock
                id='email'
                label='公司 Email'
                register={register}
                error={errors.email}
              />
              <InputBlock
                id='phone'
                label='電話'
                register={register}
                error={errors.phone}
              />
              <InputBlock
                id='deployKey'
                label='部署金鑰'
                register={register}
                error={errors.deployKey}
              />
              <div className='flex flex-col gap-1 md:col-span-2'>
                <Label htmlFor='address'>
                  公司地址 <span className='text-red-500'>*</span>
                </Label>
                <Textarea id='address' {...register('address')} className='resize-none' />
                {errors.address && (
                  <p className='text-sm text-red-500'>{errors.address.message}</p>
                )}
              </div>

              <div className='flex flex-col gap-2 md:col-span-2'>
                <Label>
                  設備授權資訊 <span className='text-red-500'>*</span>
                </Label>
                {fields.map((item, index) => {
                  const currentLicenseType = watchFingerprints?.[index]?.licenseType;

                  return (
                    <div key={item.id} className='flex flex-col gap-2 border-b pb-2'>
                      <div className='flex gap-2'>
                        <Input
                          {...register(`fingerprints.${index}.value`)}
                          placeholder='設備ID'
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          onClick={() => remove(index)}
                        >
                          移除
                        </Button>
                      </div>
                      <Controller
                        control={control}
                        name={`fingerprints.${index}.licenseType`}
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className='flex gap-4'
                          >
                            <div className='flex items-center space-x-2'>
                              <RadioGroupItem
                                value='subscription'
                                id={`sub-${item.id}`}
                              />
                              <Label htmlFor={`sub-${item.id}`}>訂閱制</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                              <RadioGroupItem value='lifetime' id={`life-${item.id}`} />
                              <Label htmlFor={`life-${item.id}`}>買斷制</Label>
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
                              openDatePicker={dateOpenMap[item.id] || false}
                              setOpenDatePicker={(open) =>
                                setDateOpenMap((prev) => ({ ...prev, [item.id]: open }))
                              }
                            />
                          )}
                        />
                      )}
                    </div>
                  );
                })}
                <Button
                  type='button'
                  variant='outline'
                  onClick={() =>
                    append({
                      id: uuidv4(),
                      value: '',
                      licenseType: 'lifetime',
                      expiryDate: new Date(),
                    })
                  }
                >
                  新增設備
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <DialogFooter className='gap-4 p-0'>
          <Button type='submit' onClick={handleSubmit(onSubmit)}>
            註冊
          </Button>
          <DialogClose onClick={() => reset()}>
            <Button variant='outline'>取消</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface InputBlockProps {
  id: keyof FormValues;
  label: string;
  register: ReturnType<typeof useForm<FormValues>>['register'];
  error?: { message?: string };
}

const InputBlock = ({ id, label, register, error }: InputBlockProps) => (
  <div className='flex flex-col gap-1'>
    <Label htmlFor={id}>
      {label} <span className='text-red-500'>*</span>
    </Label>
    <Input id={id} {...register(id)} />
    {error?.message && <p className='text-sm text-red-500'>{error.message}</p>}
  </div>
);

export default CreateCompanyDialog;
