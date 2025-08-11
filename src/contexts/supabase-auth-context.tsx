'use client';

import * as React from 'react';
import { User } from '@supabase/supabase-js';
import type { UserProfileData, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import { apiClient } from '@/lib/supabase-api-client';
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

  const handleLogout = React.useCallback(async () => {
    await apiClient.logout();
    setUser(null);
    router.push('/login');
  }, [router]);

  React.useEffect(() => {
    const verifyUser = async () => {
      console.log('AuthContext: Starting user verification...');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Session error:', error);
          setIsLoading(false);
          return;
        }

        if (!session) {
          console.log('AuthContext: No session found, checking if public page...');
          setIsLoading(false);
          const isPublicPage = ['/', '/login', '/register'].includes(pathname) || 
                              pathname.startsWith('/onboarding') || 
                              pathname.startsWith('/welcome') ||
                              pathname.includes('verification');
          
          console.log('AuthContext: Is public page:', isPublicPage, 'for path:', pathname);
          if (!isPublicPage) {
            console.log('AuthContext: Not a public page, redirecting to login...');
            router.push('/login');
          }
          return;
        }

        console.log('AuthContext: Session found, fetching user profile...');
        const userProfile = await apiClient.getCurrentUser();
        console.log('AuthContext: User profile fetched:', userProfile);
        setUser(userProfile);
      } catch (error) {
        console.error('AuthContext: Error verifying user:', error);
        setUser(null);
        const isPublicPage = ['/', '/login', '/register'].includes(pathname) || 
                            pathname.startsWith('/onboarding') || 
                            pathname.startsWith('/welcome') ||
                            pathname.includes('verification');
        
        if (!isPublicPage) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          try {
            const userProfile = await apiClient.getCurrentUser();
            setUser(userProfile);
          } catch (error) {
            console.error('AuthContext: Error fetching user after sign in:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  const value = React.useMemo(() => ({
    user,
    role: user?.role || null,
    isLoading,
    logout: handleLogout,
  }), [user, isLoading, handleLogout]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <AppLoadingScreen />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
