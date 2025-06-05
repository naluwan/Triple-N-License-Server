'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import axios from 'axios';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: '請輸入Email' })
    .email({ message: 'Email 格式錯誤' }),
  password: z.string().min(1, { message: '請輸入密碼' }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    const res = await axios.post('/api/auth', data);

    if (res.data.status === 200) {
      setToken(res.data.token);
      setUser(res.data.user);
      toast.success('登入成功');
      router.push('/dashboard');
    } else {
      toast.error(res.data.message);
    }
  };

  useEffect(() => {
    const msg = localStorage.getItem('logoutMsg');
    if (msg) {
      if (msg === '登出成功') {
        toast.success(msg);
      } else {
        toast.error(msg);
      }
      localStorage.removeItem('logoutMsg');
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
    if (savedToken) setToken(savedToken);
  }, [setToken]);

  return (
    <div className='dark:bg-background flex min-h-screen items-center justify-center bg-gray-100'>
      <Card className='w-full max-w-md p-6'>
        <CardHeader>
          <CardTitle className='text-center'>登入系統</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
              <Label htmlFor='email' className='mb-1'>
                Email
              </Label>
              <Input
                id='email'
                type='email'
                {...register('email')}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className='mt-1 text-sm text-red-500'>{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor='password' className='mb-1'>
                密碼
              </Label>
              <Input
                id='password'
                type='password'
                {...register('password')}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className='mt-1 text-sm text-red-500'>{errors.password.message}</p>
              )}
            </div>
            <Button className='w-full' type='submit' disabled={isSubmitting || !isValid}>
              {isSubmitting ? '登入中...' : '登入'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
