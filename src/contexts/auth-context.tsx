
'use client';

import * as React from 'react';
import type { UserProfileData, UserRole } from '@/types';
import AppLoadingScreen from '@/components/shared/app-loading-screen';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: UserProfileData | null;
  role: UserRole | null;
  isLoading: boolean;
  logout: () => void;
  fetchAndSetUser: (userId?: string) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  const handleLogout = React.useCallback(async () => {
    await apiClient.logout();
    setUser(null);
    router.push('/login');
  }, [router]);

  const fetchAndSetUser = React.useCallback(async (userId?: string) => {
    try {
      const userData = await apiClient.getCurrentUser(userId);
      if (!userData) {
        console.error("Profile missing for authenticated user. Logging out.");
        toast({
          title: "Profile Incomplete",
          description: "Your user profile is missing. Please log in again or contact support.",
          variant: "destructive",
        });
        handleLogout();
      } else {
        setUser(userData);
      }
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      if (error.message.includes("relation") || error.message.includes("schema")) {
        toast({
          title: "Configuration Error",
          description: "There's a problem with the system configuration. Please contact support.",
          variant: "destructive",
        });
      }
      handleLogout();
    }
  }, [handleLogout, toast]);

  React.useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      const { data: { session } } = await apiClient.supabase.auth.getSession();
      
      const isAuthPage = ['/login', '/register', '/student-verification', '/supervisor-verification', '/lecturer-verification'].includes(pathname);
      const isPublicPage = isAuthPage || pathname.startsWith('/onboarding') || pathname.startsWith('/welcome') || pathname === '/';

      if (!session) {
        if (!isPublicPage) {
          router.push('/login');
        }
        setIsLoading(false);
        return;
      }

      if (session && !user) {
        await fetchAndSetUser(session.user.id);
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();

    const { data: { subscription } } = apiClient.supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (_event === 'SIGNED_IN' && session?.user) {
          await fetchAndSetUser(session.user.id);
        } else if (_event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router, fetchAndSetUser, user]);

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, isLoading, logout: handleLogout, fetchAndSetUser }}>
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
