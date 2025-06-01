
'use client';

import * as React from 'react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'; // SidebarTrigger for mobile
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Mail, Settings, User, LogOut, Sun, Moon, PanelLeft } from 'lucide-react'; // Added Mail
import { USER_ROLES } from '@/lib/constants';
import type { UserRole } from '@/types';
import { useRouter }_ from 'next/navigation';
import Link from 'next/link'; // Added Link for profile navigation

// Dummy user data - replace with actual user data from context/auth
const DUMMY_USER = {
  name: 'John Doe', // From mockup
  email: 'john.doe@example.com',
  avatarUrl: 'https://placehold.co/100x100.png?text=JD', // Placeholder with initials
};

export default function AppHeader() {
  const { isMobile, toggleSidebar } = useSidebar(); // useSidebar hook
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const router = useRouter();
  const [pageTitle, setPageTitle] = React.useState('Dashboard'); // Placeholder for dynamic title

  React.useEffect(() => {
    const storedRole = typeof window !== "undefined" ? localStorage.getItem('userRole') as UserRole : null;
    if (storedRole) {
      setUserRole(storedRole);
    }
    const localTheme = typeof window !== "undefined" ? localStorage.getItem('theme') as 'light' | 'dark' : 'light';
    if (localTheme) {
      setTheme(localTheme);
      document.documentElement.classList.toggle('dark', localTheme === 'dark');
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem('userRole');
      localStorage.removeItem('theme');
    }
    document.documentElement.classList.remove('dark');
    router.push('/login');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Simulate dynamic page title update (in a real app, this might come from context or route)
  React.useEffect(() => {
    if(typeof window !== "undefined") {
      const currentPath = window.location.pathname.split('/').pop();
      if (currentPath) {
        setPageTitle(currentPath.charAt(0).toUpperCase() + currentPath.slice(1) || 'Dashboard');
      }
    }
  }, [typeof window !== "undefined" ? window.location.pathname : null]);


  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 shadow-sm">
      {/* Mobile Sidebar Trigger */}
      {isMobile && (
         <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      )}
      
      {/* Page Title */}
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications Icon - from mockup */}
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Messages Icon - from mockup */}
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Mail className="h-5 w-5" />
           <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border-2 border-card"></span>
          <span className="sr-only">Messages</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 rounded-full p-0 md:px-2 md:w-auto">
              <Avatar className="h-8 w-8">
                <AvatarImage src={DUMMY_USER.avatarUrl} alt={DUMMY_USER.name} data-ai-hint="person portrait"/>
                <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(DUMMY_USER.name)}</AvatarFallback>
              </Avatar>
              <span className="ml-2 text-foreground hidden md:inline">{DUMMY_USER.name}</span>
              <ChevronDown className="ml-1 text-muted-foreground hidden md:inline h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 font-body">
            <DropdownMenuLabel className="font-medium">
              <p>{DUMMY_USER.name}</p>
              <p className="text-xs text-muted-foreground font-normal">{DUMMY_USER.email}</p>
              {userRole && <p className="text-xs text-primary font-normal">{USER_ROLES[userRole]}</p>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
               <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
