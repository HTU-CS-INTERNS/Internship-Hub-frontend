
'use client'; 

import * as React from 'react';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import MobileHeader from '@/components/layout/mobile-header';
import MobileBottomNav from '@/components/layout/mobile-bottom-nav';
import type { UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();
  const isMobileView = useIsMobile(); // Use the hook here

  React.useEffect(() => {
    const storedRole = typeof window !== "undefined" ? localStorage.getItem('userRole') as UserRole : null;
    if (storedRole) {
      setUserRole(storedRole);
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="p-4 rounded-md text-foreground">Loading application...</div>
      </div>
    );
  }
  
  if (!userRole) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="p-4 rounded-md text-foreground">Redirecting to login...</div>
      </div>
     );
  }

  if (isMobileView) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <MobileHeader userRole={userRole} />
        <main className="flex-1 overflow-y-auto pb-[var(--mobile-bottom-nav-height)] pt-[var(--mobile-header-height)]">
          {children}
        </main>
        <MobileBottomNav userRole={userRole} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar userRole={userRole} />
      <div className="flex flex-col flex-1 overflow-x-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
