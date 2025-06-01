
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListChecks, MapPin, UserCircle, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';
import { NAV_LINKS, BOTTOM_NAV_LINKS } from '@/lib/constants'; // Use main NAV_LINKS

interface MobileBottomNavProps {
  userRole: UserRole;
}

export default function MobileBottomNav({ userRole }: MobileBottomNavProps) {
  const pathname = usePathname();

  // Filter NAV_LINKS for items marked with mobile: true and relevant to userRole
  const mobileNavItems = NAV_LINKS.filter(item => item.mobile && item.roles.includes(userRole))
    .slice(0, 5); // Take up to 5 items for bottom nav

  // If dashboard isn't explicitly in mobile items for some reason, add it for students.
  if (userRole === 'STUDENT' && !mobileNavItems.find(item => item.href === '/dashboard')) {
      const dashboardLink = NAV_LINKS.find(item => item.href === '/dashboard');
      if (dashboardLink) mobileNavItems.unshift(dashboardLink);
  }
   // Ensure Profile is available if space, otherwise might need a "More" tab concept
  if (!mobileNavItems.find(item => item.href === '/profile')) {
    const profileLink = NAV_LINKS.concat(BOTTOM_NAV_LINKS).find(item => item.href === '/profile' && item.roles.includes(userRole));
    if (profileLink && mobileNavItems.length < 5) {
        mobileNavItems.push({...profileLink, icon: UserCircle }); // Use UserCircle for mobile profile
    }
  }


  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center h-[var(--mobile-bottom-nav-height)] bg-card border-t border-border shadow-top-md">
      {mobileNavItems.slice(0,5).map((item) => { // Ensure max 5 items
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        const IconComponent = item.icon || Home; // Fallback icon

        return (
          <Link key={item.href} href={item.href} passHref>
            <div className={cn(
              "flex flex-col items-center justify-center h-full px-1 text-muted-foreground hover:text-primary transition-colors w-1/5", // Ensure items spread out
              isActive && "text-primary"
            )}>
              <IconComponent className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] font-medium truncate w-full text-center">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

    