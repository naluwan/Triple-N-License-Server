'use client';

import { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/authStore';
import { LogOut } from 'lucide-react';

const DashboardLayout = ({ children }: PropsWithChildren) => {
  const onLogout = useAuthStore((state) => state.logout);

  return (
    <div className='bg-muted/40 text-muted-foreground flex min-h-screen flex-col'>
      {/* Header */}
      <header className='bg-background flex h-16 w-full items-center justify-between border-b px-6 shadow-sm'>
        <h1 className='text-primary text-lg font-semibold'>
          Triple N License Server Dashboard
        </h1>
        <Button
          variant='ghost'
          size='sm'
          onClick={onLogout}
          className='flex items-center gap-2'
        >
          <LogOut className='h-4 w-4' />
          登出
        </Button>
      </header>

      {/* Main Content */}
      <main className={cn('mx-auto w-full max-w-6xl flex-1 px-6 py-8')}>{children}</main>
    </div>
  );
};

export default DashboardLayout;
