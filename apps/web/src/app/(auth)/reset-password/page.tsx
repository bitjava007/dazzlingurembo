'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth.service';
import { toast } from '@/hooks/use-toast';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast({ title: 'Error', description: 'Invalid or missing reset token.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      toast({ title: 'Password reset!', description: 'You can now sign in with your new password.' });
      router.push('/login');
    } catch {
      toast({ title: 'Error', description: 'Failed to reset password. Token may be expired.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-8 shadow-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-gray-400 text-sm mt-1">Enter your new password</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">New Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              className="bg-[#1A1A1A] border-[#2A2A2A] text-white focus-visible:ring-[#C9A84C]"
            />
            {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className="bg-[#1A1A1A] border-[#2A2A2A] text-white focus-visible:ring-[#C9A84C]"
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-bold"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
