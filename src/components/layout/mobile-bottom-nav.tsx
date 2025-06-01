
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListChecks, CalendarDays, UserCircle, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

interface MobileBottomNavProps {
  userRole: UserRole;
}

// Simplified nav items for mobile bottom bar
const mobileNavItems = [
  { href: '/dashboard', label: 'Home', icon: Home, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD'] },
  { href: '/tasks', label: 'Tasks', icon: ListChecks, roles: ['STUDENT'] }, // Student specific
  { href: '/check-in', label: 'Check-in', icon: MapPin, roles: ['STUDENT'] }, // Student specific
  { href: '/schedule', label: 'Schedule', icon: CalendarDays, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD'] },
  { href: '/profile', label: 'Profile', icon: UserCircle, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD'] },
];


export default function MobileBottomNav({ userRole }: MobileBottomNavProps) {
  const pathname = usePathname();

  const filteredNavItems = mobileNavItems.filter(item => item.roles.includes(userRole));
  // Ensure we have a reasonable number of items, typically 3-5 for bottom nav.
  // If more, might need a "More" tab or different strategy. For now, let's take up to 5.
  const displayItems = filteredNavItems.slice(0, 5);


  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center h-[var(--mobile-bottom-nav-height)] bg-card border-t border-border shadow-top-md">
      {displayItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} passHref>
            <div className={cn(
              "flex flex-col items-center justify-center h-full px-2 text-muted-foreground hover:text-primary transition-colors",
              isActive && "text-primary"
            )}>
              <item.icon className="h-6 w-6 mb-0.5" />
              <span className="text-xs font-medium">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
