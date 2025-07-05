'use client';
// This page is no longer used for direct registration.
// It redirects users to the login page, supporting legacy links while removing public signup.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLoadingScreen from '@/components/shared/app-loading-screen';

export default function RegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return <AppLoadingScreen />;
}
