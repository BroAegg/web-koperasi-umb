'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';
import { DashboardLoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function DashboardPage() {
  const { user, loading, authorized } = useAuth(['ADMIN', 'SUPER_ADMIN']);
  const router = useRouter();

  useEffect(() => {
    if (!loading && authorized && user) {
      // Route to role-specific dashboard
      if (user.role === 'SUPER_ADMIN') {
        router.replace('/koperasi/super-admin-dashboard');
      } else if (user.role === 'ADMIN') {
        router.replace('/koperasi/admin-dashboard');
      }
    }
  }, [user, loading, authorized, router]);

  if (loading || !authorized) {
    return <DashboardLoadingSkeleton />;
  }

  // Show loading while redirecting
  return <DashboardLoadingSkeleton />;
}