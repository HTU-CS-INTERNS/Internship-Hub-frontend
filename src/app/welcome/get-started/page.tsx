
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLoadingScreen from '@/components/shared/app-loading-screen';

export default function GetStartedRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding/step1');
  }, [router]);

  return <AppLoadingScreen />;
}
