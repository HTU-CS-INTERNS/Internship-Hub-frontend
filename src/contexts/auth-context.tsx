
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
      const token = typeof window !== "undefined" ? localStorage.getItem('authToken') : null;
      if (!token) {
        setIsLoading(false);
        const isPublicPage = ['/', '/login', '/register'].includes(pathname) || pathname.startsWith('/onboarding') || pathname.startsWith('/welcome');
        if (!isPublicPage) {
            router.push('/login');
        }
        return;
      }

      try {
        const userData = await api<UserProfileData>('/auth/me'); 
        if (userData) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('userRole', userData.role);
          localStorage.setItem('userName', `${userData.first_name} ${userData.last_name}`);
          localStorage.setItem('userEmail', userData.email);
        } else {
            throw new Error("User not found for token");
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
        handleLogout();
      } finally {
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
