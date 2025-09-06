
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import AppLoadingScreen from '@/components/shared/app-loading-screen';

export default function DashboardRedirectPage() {
  const { role, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && role) {
      switch (role) {
        case 'STUDENT':
          router.replace('/student/dashboard');
          break;
        case 'LECTURER':
          router.replace('/lecturer/dashboard');
          break;
        case 'SUPERVISOR':
          router.replace('/industrial-supervisor/dashboard');
          break;
        case 'HOD':
          router.replace('/department-ops');
          break;
        case 'ADMIN':
          router.replace('/admin/dashboard');
          break;
        default:
          // Fallback or error page if role is unknown
          router.replace('/login');
          break;
      }
    }
  }, [role, isLoading, router]);

  // Show a loading screen while determining the role and redirecting
  return <AppLoadingScreen />;
}
