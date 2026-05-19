'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth.service';
import { toast } from '@/hooks/use-toast';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } catch {
      toast({ title: 'Error', description: 'Failed to send reset email.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-8 shadow-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
          <p className="text-gray-400 text-sm mt-1">Enter your email to receive a reset link</p>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <p className="text-green-400 font-medium">Reset email sent!</p>
            <p className="text-gray-400 text-sm mt-2">Check your inbox for instructions.</p>
            <a href="/login" className="mt-4 inline-block text-[#C9A84C] hover:text-[#D4AF37] text-sm">
              Back to login
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                {...register('email')}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-600 focus-visible:ring-[#C9A84C]"
              />
              {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-bold"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="text-center">
              <a href="/login" className="text-sm text-[#C9A84C] hover:text-[#D4AF37]">
                Back to login
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
