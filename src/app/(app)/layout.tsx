'use client'; // Required for SidebarProvider and hooks

import * as React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import type { UserRole } from '@/types';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate fetching user role or getting from auth context
    // In a real app, this would come from your authentication state management
    const storedRole = typeof window !== "undefined" ? localStorage.getItem('userRole') as UserRole : null;
    if (storedRole) {
      setUserRole(storedRole);
    } else {
      // Default or redirect if no role (e.g., back to login)
      // For this example, defaulting to STUDENT if no role found.
      // router.push('/login'); // Example redirect
      setUserRole('STUDENT'); 
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-4 rounded-md">Loading application...</div>
      </div>
    );
  }
  
  if (!userRole) {
     // This case should ideally be handled by redirecting to login if role is truly unknown
     // For now, rendering a fallback or redirecting can be done here
     return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-4 rounded-md">Authenticating...</div>
      </div>
     );
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen">
        <AppSidebar userRole={userRole} />
        <div className="flex flex-col flex-1">
          <AppHeader />
          <main className="flex-1 p-4 sm:p-6 md:p-8 bg-background overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
