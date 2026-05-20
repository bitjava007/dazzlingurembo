'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { AppLayout } from '@/components/layout/app-layout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  // Zustand's persist middleware rehydrates from localStorage after the first
  // client render. Reading isAuthenticated before hydration always returns false
  // (the store's initial value), causing a spurious redirect on every page
  // refresh. The mounted flag defers the auth check until after hydration.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  // Don't render anything until we know the real auth state.
  if (!mounted || !isAuthenticated) {
    return null;
  }

  return <AppLayout>{children}</AppLayout>;
}
