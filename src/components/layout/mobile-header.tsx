
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bell, Briefcase, Settings } from 'lucide-react';
import type { UserRole } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

const DUMMY_USER = {
  name: 'John Doe',
  avatarUrl: 'https://placehold.co/100x100.png?text=JD',
};
const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

interface MobileHeaderProps {
  userRole: UserRole | null;
}

export default function MobileHeader({ userRole }: MobileHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem('userRole');
      localStorage.removeItem('theme');
    }
    document.documentElement.classList.remove('dark'); // Ensure dark mode is reset
    router.push('/login');
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-[var(--mobile-header-height)] px-4 bg-primary text-primary-foreground shadow-md">
      <Link href="/dashboard" className="flex items-center space-x-2">
        <Briefcase className="h-6 w-6" />
        <h1 className="font-bold text-xl font-headline">InternshipTrack</h1>
      </Link>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0 hover:bg-primary/80">
               <Avatar className="h-8 w-8">
                  <AvatarImage src={DUMMY_USER.avatarUrl} alt={DUMMY_USER.name} data-ai-hint="person portrait"/>
                  <AvatarFallback className="bg-primary-foreground text-primary">{getInitials(DUMMY_USER.name)}</AvatarFallback>
                </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Profile & Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
