
'use client'; 
import * as React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar'; 
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import MobileHeader from '@/components/layout/mobile-header';
import MobileBottomNav from '@/components/layout/mobile-bottom-nav';
import { useAuth } from '@/contexts/auth-context';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLoadingScreen from '@/components/shared/app-loading-screen';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading } = useAuth();
  const isMobileView = useIsMobile();

  if (isLoading || !user || !role) {
    // Show a loading screen while auth state is being determined
    return <AppLoadingScreen />;
  }

  if (isMobileView) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <style jsx global>{`
          :root {
            --app-header-height: var(--mobile-header-height);
          }
        `}</style>
        <MobileHeader userRole={role} />
        <main className="flex-1 overflow-y-auto pb-[var(--mobile-bottom-nav-height)] pt-[var(--mobile-header-height)]">
          {children}
        </main>
        <MobileBottomNav userRole={role} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <style jsx global>{`
        :root {
          --app-header-height: 4rem; 
        }
      `}</style>
      <AppSidebar userRole={role} />
      <div className="flex flex-col flex-1 overflow-x-hidden">
        <AppHeader />
        <main className="flex flex-col flex-1 overflow-y-auto"> 
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
