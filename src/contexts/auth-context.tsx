
'use client';

import * as React from 'react';
import type { UserProfileData, UserRole } from '@/types';
import AppLoadingScreen from '@/components/shared/app-loading-screen';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

interface AuthContextType {
  user: UserProfileData | null;
  role: UserRole | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = React.useCallback(() => {
    apiClient.logout();
    setUser(null);
    router.push('/login');
  }, [router]);

  React.useEffect(() => {
    const checkAuthStatus = async () => {
      console.log('AuthContext: Checking auth status...');
      const token = typeof window !== "undefined" ? localStorage.getItem('authToken') : null;
      console.log('AuthContext: Token found:', !!token);
      
      const isPublicPage = ['/login', '/register', '/student-verification', '/supervisor-verification', '/lecturer-verification'].includes(pathname) || pathname.startsWith('/onboarding') || pathname.startsWith('/welcome') || pathname === '/';
      
      if (!token) {
        console.log('AuthContext: No token, checking if public page...');
        setIsLoading(false);
        if (!isPublicPage) {
            console.log('AuthContext: Not public, redirecting to login...');
            router.push('/login');
        }
        return;
      }

      // If token exists, trust localStorage user data for this mock setup.
      try {
        const currentUser = await apiClient.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            console.log('AuthContext: User authenticated from localStorage.');
        } else {
            console.log('AuthContext: Token exists, but no user data. Logging out.');
            handleLogout();
        }
      } catch (error) {
        console.error('AuthContext: Error getting current user from mock client:', error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [pathname, router, handleLogout]);

  if (isLoading) {
    return <AppLoadingScreen />;
  }
  
  const isPublicPage = ['/login', '/register', '/student-verification', '/supervisor-verification', '/lecturer-verification'].includes(pathname) || pathname.startsWith('/onboarding') || pathname.startsWith('/welcome') || pathname === '/';
  if (!user && !isLoading && !isPublicPage) {
      // While redirecting, show loading screen
      return <AppLoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, isLoading, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
