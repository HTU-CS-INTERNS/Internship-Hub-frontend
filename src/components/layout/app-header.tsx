'use client';

import * as React from 'react';
import { useSidebar, SidebarTrigger } from '@/components/ui/sidebar';
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
import { Bell, Search, Settings, User, LogOut, Sun, Moon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { USER_ROLES } from '@/lib/constants';
import type { UserRole } from '@/types';
import { useRouter } from 'next/navigation'; // Corrected import

// Dummy user data - replace with actual user data from context/auth
const DUMMY_USER = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatarUrl: 'https://placehold.co/100x100.png',
};

export default function AppHeader() {
  const { toggleSidebar, isMobile } = useSidebar();
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const router = useRouter();

  React.useEffect(() => {
    const storedRole = typeof window !== "undefined" ? localStorage.getItem('userRole') as UserRole : null;
    if (storedRole) {
      setUserRole(storedRole);
    }
    const localTheme = typeof window !== "undefined" ? localStorage.getItem('theme') as 'light' | 'dark' : 'light';
    setTheme(localTheme);
    document.documentElement.classList.toggle('dark', localTheme === 'dark');
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

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 shadow-sm">
      {isMobile && <SidebarTrigger />}
      {!isMobile && <div className="w-8 h-8" /> /* Placeholder for non-mobile trigger alignment */}
      
      <div className="flex-1 relative hidden md:block">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search tasks, reports, students..."
          className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background"
        />
      </div>

      <div className="flex items-center gap-3 md:gap-4 ml-auto">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-destructive rounded-full">
            3
          </span>
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={DUMMY_USER.avatarUrl} alt={DUMMY_USER.name} data-ai-hint="person portrait" />
                <AvatarFallback>{getInitials(DUMMY_USER.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 font-body">
            <DropdownMenuLabel className="font-medium">
              <p>{DUMMY_USER.name}</p>
              <p className="text-xs text-muted-foreground font-normal">{DUMMY_USER.email}</p>
              {userRole && <p className="text-xs text-primary font-normal">{USER_ROLES[userRole]}</p>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
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
