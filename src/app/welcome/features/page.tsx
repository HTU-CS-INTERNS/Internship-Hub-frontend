
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLoadingScreen from '@/components/shared/app-loading-screen';

export default function FeaturesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/welcome/get-started');
  }, [router]);

  return <AppLoadingScreen />;
}
