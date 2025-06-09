
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListChecks, MapPin, UserCircle, CalendarDays, Briefcase, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole, NavItem } from '@/types';
import { NAV_LINKS, BOTTOM_NAV_LINKS } from '@/lib/constants'; 

interface MobileBottomNavProps {
  userRole: UserRole;
}

export default function MobileBottomNav({ userRole }: MobileBottomNavProps) {
  const pathname = usePathname();

  const getFilteredMobileNavItems = (): NavItem[] => {
    let baseItems = NAV_LINKS.filter(item => item.mobile && item.roles.includes(userRole));

    // Ensure Dashboard is first for most roles if not already present
    if (!baseItems.find(item => item.href === '/dashboard')) {
      const dashboardLink = NAV_LINKS.find(item => item.href === '/dashboard' && item.roles.includes(userRole));
      if (dashboardLink) {
        baseItems = [dashboardLink, ...baseItems.filter(item => item.href !== '/dashboard')];
      }
    }

    // Ensure specific primary items are present if space allows (max 5 items for bottom nav)
    const primaryMobileItems: Record<UserRole, string[]> = {
      STUDENT: ['/dashboard', '/student/tasks', '/student/reports', '/student/check-in', '/profile'],
      LECTURER: ['/dashboard', '/assignments', '/communication', '/schedule', '/profile'],
      SUPERVISOR: ['/dashboard', '/supervisor/interns', '/communication', '/schedule', '/profile'],
      HOD: ['/dashboard', '/department-ops', '/assignments', '/analytics', '/profile'],
      ADMIN: ['/dashboard', '/admin/dashboard', '/admin/user-management', '/admin/university-structure', '/profile'],
    };

    const roleSpecificOrder = primaryMobileItems[userRole] || ['/dashboard', '/profile'];
    let finalItems: NavItem[] = [];

    // Add items based on roleSpecificOrder
    roleSpecificOrder.forEach(href => {
      if (finalItems.length < 5) {
        const item = [...NAV_LINKS, ...BOTTOM_NAV_LINKS].find(link => link.href === href && link.roles.includes(userRole));
        if (item && !finalItems.some(fi => fi.href === item.href)) {
          finalItems.push(item);
        }
      }
    });

    // Fill remaining spots with other mobile items if needed, up to 5
    baseItems.forEach(item => {
      if (finalItems.length < 5 && !finalItems.some(fi => fi.href === item.href)) {
        finalItems.push(item);
      }
    });
    
    // Ensure Profile has UserCircle icon if it was added this way
    finalItems = finalItems.map(item => item.href === '/profile' ? {...item, icon: UserCircle} : item);

    return finalItems.slice(0, 5);
  };
  
  const mobileNavItems = getFilteredMobileNavItems();


  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-stretch h-[var(--mobile-bottom-nav-height)] bg-card border-t border-border shadow-top-md">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/' && pathname.startsWith(item.href));
        const IconComponent = item.icon || Home; 

        return (
          <Link key={item.href} href={item.href} passHref>
            <div className={cn(
              "flex flex-col items-center justify-center h-full px-1 text-muted-foreground hover:text-primary transition-colors w-full pt-1 pb-0.5", 
              isActive && "text-primary"
            )}>
              <IconComponent className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] font-medium truncate w-full text-center leading-tight">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

