'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLoadingScreen from '@/components/shared/app-loading-screen';

export default function RootRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // This is a simple client-side check. AuthProvider will do the more robust check.
    const token = typeof window !== "undefined" ? localStorage.getItem('authToken') : null;
    if (token) {
      router.replace('/dashboard');
    } else {
      router.replace('/welcome');
    }
  }, [router]);

  // Show a loading screen while redirecting.
  return <AppLoadingScreen />;
}
