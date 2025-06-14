
'use client';
// This page's content has been moved to src/app/page.tsx to make it the root.
// This component can be removed or kept as a simple redirect for any old links.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLoadingScreen from '@/components/shared/app-loading-screen';

export default function WelcomePageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return <AppLoadingScreen />;
}
