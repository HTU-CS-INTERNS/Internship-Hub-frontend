'use client';

import * as React from 'react';
import type { UserProfileData, UserRole } from '@/types';
import api from '@/lib/api';
import AppLoadingScreen from '@/components/shared/app-loading-screen';
import { useRouter, usePathname } from 'next/navigation';

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
      
      if (!token) {
        console.log('AuthContext: No token found, checking if public page...');
        setIsLoading(false);
        const isPublicPage = ['/', '/login', '/register'].includes(pathname) || pathname.startsWith('/onboarding') || pathname.startsWith('/welcome');
        console.log('AuthContext: Is public page:', isPublicPage, 'for path:', pathname);
        if (!isPublicPage) {
            console.log('AuthContext: Not a public page, redirecting to login...');
            router.push('/login');
        }
        return;
      }

      try {
        console.log('AuthContext: Attempting to verify user with /auth/me...');
        const userData = await api<UserProfileData>('/auth/me'); 
        console.log('AuthContext: User data received:', userData);
        
        if (userData) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('userRole', userData.role);
          localStorage.setItem('userName', `${userData.first_name} ${userData.last_name}`);
          localStorage.setItem('userEmail', userData.email);
          console.log('AuthContext: User authenticated successfully, role:', userData.role);
        } else {
            throw new Error("User not found for token");
        }
      } catch (error) {
        console.error('AuthContext: Authentication failed:', error);
        
        // Check if it's a network error (backend not running)
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch') || errorMessage.includes('Network request failed')) {
          console.log('AuthContext: Network error detected, backend might be down. Keeping user logged in for now.');
          // Try to get user data from localStorage as fallback
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              setUser(userData);
              console.log('AuthContext: Using stored user data as fallback:', userData.role);
            } catch (parseError) {
              console.error('AuthContext: Failed to parse stored user data:', parseError);
              handleLogout();
            }
          } else {
            console.log('AuthContext: No stored user data available, logging out');
            handleLogout();
          }
        } else {
          // For other errors (like invalid token), logout immediately
          console.log('AuthContext: Non-network error, logging out immediately');
          handleLogout();
        }
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

  const isPublicPage = ['/', '/login', '/register'].includes(pathname) || pathname.startsWith('/onboarding') || pathname.startsWith('/welcome');
  if (!user && !isLoading && !isPublicPage) {
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
