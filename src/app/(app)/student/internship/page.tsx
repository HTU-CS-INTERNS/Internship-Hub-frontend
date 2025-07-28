
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLoadingScreen from '@/components/shared/app-loading-screen';

export default function InternshipRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the profile page, specifically to the internship tab
    router.replace('/profile#internship');
  }, [router]);

  return <AppLoadingScreen />;
}
