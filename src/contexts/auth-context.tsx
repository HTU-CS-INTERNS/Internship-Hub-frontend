
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
    setUser(null);
    if (typeof window !== "undefined") {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('isLoggedIn'); // Clear legacy flag
    }
    router.push('/login');
  }, [router]);

  React.useEffect(() => {
    const verifyUser = async () => {
      console.log('AuthContext: Starting user verification...');
      const token = typeof window !== "undefined" ? localStorage.getItem('authToken') : null;
      console.log('AuthContext: Token found:', !!token);
      
      const isPublicPage = ['/login', '/register', '/student-verification', '/supervisor-verification', '/lecturer-verification'].includes(pathname) || pathname.startsWith('/onboarding') || pathname.startsWith('/welcome') || pathname === '/';
      
      if (!token) {
        console.log('AuthContext: No token found, checking if public page...');
        setIsLoading(false);
        console.log('AuthContext: Is public page:', isPublicPage, 'for path:', pathname);
        if (!isPublicPage) {
            console.log('AuthContext: Not a public page, redirecting to login...');
            router.push('/login');
        }
        return;
      }

      // If we have a token, we are likely logged in.
      // In this mock setup, we trust the localStorage data.
      try {
        console.log('AuthContext: Attempting to get user data from localStorage...');
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            const normalizedRole = normalizeRole(userData.role);
            const userWithNormalizedRole = { ...userData, role: normalizedRole };
            setUser(userWithNormalizedRole);
            console.log('AuthContext: User authenticated from localStorage.');
        } else {
            // This might happen if token exists but user data is cleared
            console.log('AuthContext: Token exists, but no user data in localStorage. Logging out.');
            handleLogout();
        }
      } catch (error) {
        console.error('AuthContext: Authentication with localStorage failed:', error);
        handleLogout();
      } finally {
        console.log('AuthContext: Setting loading to false');
        setIsLoading(false);
      }
    };
    verifyUser();
  }, [pathname, router, handleLogout]);

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  const isPublicPage = ['/login', '/register', '/student-verification', '/supervisor-verification', '/lecturer-verification'].includes(pathname) || pathname.startsWith('/onboarding') || pathname.startsWith('/welcome') || pathname === '/';
  if (!user && !isLoading && !isPublicPage) {
      // If we are done loading, not on a public page, and have no user, show loading screen while we redirect.
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

function normalizeRole(role: string): UserRole {
  const roleMap: Record<string, UserRole> = {
    'admin': 'ADMIN',
    'student': 'STUDENT', 
    'lecturer': 'LECTURER',
    'company_supervisor': 'SUPERVISOR',
    'supervisor': 'SUPERVISOR',
    'hod': 'HOD'
  };
  
  return roleMap[role.toLowerCase()] || role.toUpperCase() as UserRole;
}
