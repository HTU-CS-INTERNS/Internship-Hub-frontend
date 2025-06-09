
'use client';

import * as React from 'react';
import { useSidebar } from '@/components/ui/sidebar';
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
import { Bell, Mail, Settings, User, LogOut, Sun, Moon, PanelLeft, ChevronDown, Briefcase } from 'lucide-react';
import { USER_ROLES } from '@/lib/constants';
import type { UserRole } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
// Removed Firebase Auth import

const getInitials = (name: string) => {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export default function AppHeader() {
  const { isMobile, toggleSidebar } = useSidebar();
  const [userRole, setUserRole] = React.useState<UserRole | null>(null);
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const router = useRouter();
  const pathname = usePathname();
  const [pageTitle, setPageTitle] = React.useState('Dashboard');
  
  const [currentUser, setCurrentUser] = React.useState({
    name: 'User',
    email: 'user@example.com',
    avatarUrl: 'https://placehold.co/100x100.png',
  });

  React.useEffect(() => {
    const storedRole = typeof window !== "undefined" ? localStorage.getItem('userRole') as UserRole : null;
    if (storedRole) setUserRole(storedRole);
    
    const localTheme = typeof window !== "undefined" ? localStorage.getItem('theme') as 'light' | 'dark' : 'light';
    setTheme(localTheme);
    document.documentElement.classList.toggle('dark', localTheme === 'dark');

    const storedName = typeof window !== "undefined" ? localStorage.getItem('userName') : 'User';
    const storedEmail = typeof window !== "undefined" ? localStorage.getItem('userEmail') : 'user@example.com';
    setCurrentUser({
        name: storedName || 'User',
        email: storedEmail || 'user@example.com',
        avatarUrl: `https://placehold.co/100x100.png?text=${getInitials(storedName || 'U')}`,
    });

  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem('userRole');
      localStorage.removeItem('theme');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('isLoggedIn'); // Clear login status
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
  
  React.useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    let title = 'Dashboard'; 
    if (pathSegments.length > 0) {
      const lastSegment = pathSegments[pathSegments.length -1];
      if (pathSegments.length > 1 && (lastSegment.match(/^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/) || /^\d+$/.test(lastSegment) || lastSegment.startsWith('task') || lastSegment.startsWith('report'))) {
        title = pathSegments[pathSegments.length - 2] || lastSegment;
      } else {
        title = lastSegment;
      }
      title = title.charAt(0).toUpperCase() + title.slice(1).replace('-', ' ');
      if (title.toLowerCase() === 'app') title = 'Dashboard'; 
    }
    setPageTitle(title);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 shadow-sm">
      {!isMobile && (
         <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:flex text-muted-foreground hover:text-foreground">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      )}
      
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-1 md:gap-2 ml-auto">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full text-muted-foreground hover:text-foreground">
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          <span className="sr-only">Toggle theme</span>
        </Button>

        <Button variant="ghost" size="icon" className="rounded-full relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
          <span className="sr-only">Notifications</span>
        </Button>

        <Button variant="ghost" size="icon" className="rounded-full relative text-muted-foreground hover:text-foreground">
          <Mail className="h-5 w-5" />
           <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-card"></span>
          <span className="sr-only">Messages</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 rounded-lg p-0 md:px-2 md:w-auto hover:bg-accent/20">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="person portrait"/>
                <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <span className="ml-2 text-foreground hidden md:inline">{currentUser.name}</span>
              <ChevronDown className="ml-1 text-muted-foreground hidden md:inline h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 font-body">
            <DropdownMenuLabel className="font-medium">
              <p>{currentUser.name}</p>
              <p className="text-xs text-muted-foreground font-normal">{currentUser.email}</p>
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
