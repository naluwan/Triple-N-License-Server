import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Monitor } from 'lucide-react';
import axios from 'axios';

export type Fingerprint = {
  value: string;
  registeredAt: string;
  status: 'active' | 'revoked';
};

const ViewFingerprintDialog = ({
  companyId,
  fingerprints,
  mutate,
}: {
  companyId: string;
  fingerprints: Fingerprint[];
  mutate?: () => void;
}) => {
  const toggleStatus = async (value: string, currentStatus: 'active' | 'revoked') => {
    try {
      const res = await axios.put('/api/company/fingerprint-status', {
        companyId,
        fingerprint: value,
        newStatus: currentStatus === 'active' ? 'revoked' : 'active',
      });
      if (res.data.status === 200) {
        toast.success(res.data.message);
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
        <div className='space-y-4'>
          {fingerprints.length === 0 ? (
            <p className='text-muted-foreground text-sm'>尚無授權設備</p>
          ) : (
            fingerprints.map((fp, idx) => (
              <div key={idx} className='rounded-md border p-3 text-sm shadow-sm'>
                <p className='break-all font-mono text-xs'>
                  <strong>設備ID：</strong> {fp.value}
                </p>
                <p className='text-muted-foreground text-xs'>
                  註冊時間：{new Date(fp.registeredAt).toLocaleDateString()}
                </p>
                <div className='flex items-center justify-between pt-1'>
                  <p
                    className={`text-xs font-medium ${
                      fp.status === 'active' ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    狀態：{fp.status === 'active' ? '啟用中' : '已撤銷'}
                  </p>
                  <Button
                    size='sm'
                    variant='outline'
                    className='h-6 text-xs'
                    onClick={() => toggleStatus(fp.value, fp.status)}
                  >
                    {fp.status === 'active' ? '撤銷' : '啟用'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewFingerprintDialog;
