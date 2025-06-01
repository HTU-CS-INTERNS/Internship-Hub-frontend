
'use client'; 

import * as React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import type { UserRole } from '@/types';
import { useRouter } from 'next/navigation'; // Added for potential redirect

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const storedRole = typeof window !== "undefined" ? localStorage.getItem('userRole') as UserRole : null;
    if (storedRole) {
      setUserRole(storedRole);
    } else {
      // Default to STUDENT for demo purposes, or redirect to login
      // setUserRole('STUDENT'); 
      router.push('/login'); // More robust: redirect if no role
    }
    setIsLoading(false);
  }, [router]); // Added router to dependency array

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="p-4 rounded-md text-foreground">Loading application...</div>
      </div>
    );
  }
  
  if (!userRole) {
     // This case should ideally be handled by redirecting to login if role is truly unknown
     // The useEffect above now handles redirection
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="p-4 rounded-md text-foreground">Redirecting to login...</div>
      </div>
     );
  }

  return (
    // DefaultOpen true to match mockup's initially open sidebar.
    // "icon" collapsible will allow it to shrink to icons.
    <SidebarProvider defaultOpen={true}> 
      <div className="flex min-h-screen bg-background"> {/* Ensure background color here too */}
        <AppSidebar userRole={userRole} />
        <div className="flex flex-col flex-1 overflow-x-hidden"> {/* Added overflow-x-hidden to prevent horizontal scroll from main content */}
          <AppHeader />
          {/* main content takes up remaining space and scrolls */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
