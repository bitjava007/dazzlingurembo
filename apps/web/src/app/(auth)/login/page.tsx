'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response = await authService.login(data.email, data.password);
      setAuth(response.user, response.token);
      router.push('/dashboard');
    } catch {
      toast({ title: 'Login failed', description: 'Invalid email or password.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-8 shadow-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Sign In</h1>
          <p className="text-gray-400 text-sm mt-1">Enter your credentials to access the platform</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              {...register('email')}
              className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-600 focus-visible:ring-[#C9A84C]"
            />
            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-600 focus-visible:ring-[#C9A84C]"
            />
            {errors.password && (
              <p className="text-red-400 text-xs">{errors.password.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <a href="/forgot-password" className="text-xs text-[#C9A84C] hover:text-[#D4AF37]">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-bold text-sm h-11"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
