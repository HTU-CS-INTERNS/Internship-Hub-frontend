
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListChecks, MapPin, UserCircle, CalendarDays, Briefcase, MessageSquare, Users, GraduationCap, BarChart3, School } from 'lucide-react'; // Added more icons
import { cn } from '@/lib/utils';
import type { UserRole, NavItem } from '@/types';
import { NAV_LINKS, BOTTOM_NAV_LINKS } from '@/lib/constants'; 

interface MobileBottomNavProps {
  userRole: UserRole;
}

export default function MobileBottomNav({ userRole }: MobileBottomNavProps) {
  const pathname = usePathname();

  const getFilteredMobileNavItems = (): NavItem[] => {
    // Start with items explicitly marked for mobile from NAV_LINKS and all from BOTTOM_NAV_LINKS
    let potentialItems = [
        ...NAV_LINKS.filter(item => item.mobile && item.roles.includes(userRole)),
        ...BOTTOM_NAV_LINKS.filter(item => item.mobile && item.roles.includes(userRole))
    ];
    
    // Define role-specific primary items. These are preferred.
    const primaryMobileItemsMap: Record<UserRole, string[]> = {
      STUDENT: ['/dashboard', '/student/tasks', '/student/reports', '/student/check-in', '/profile'],
      LECTURER: ['/dashboard', '/assignments', '/communication', '/schedule', '/profile'],
      SUPERVISOR: ['/dashboard', '/supervisor/interns', '/communication', '/schedule', '/profile'],
      HOD: ['/dashboard', '/department-ops', '/assignments', '/analytics', '/profile'],
      ADMIN: ['/admin/dashboard', '/admin/user-management', '/admin/university-structure', '/analytics', '/profile'],
    };

    const roleSpecificHrefs = primaryMobileItemsMap[userRole] || ['/dashboard', '/profile'];
    let finalItems: NavItem[] = [];

    // Add items based on roleSpecificHrefs first
    roleSpecificHrefs.forEach(href => {
      if (finalItems.length < 5) {
        const item = [...NAV_LINKS, ...BOTTOM_NAV_LINKS].find(link => link.href === href && link.roles.includes(userRole));
        if (item && !finalItems.some(fi => fi.href === item.href)) {
          finalItems.push(item);
        }
      }
    });

    // Fill remaining spots with other potential mobile items if needed, up to 5
    potentialItems.forEach(item => {
      if (finalItems.length < 5 && !finalItems.some(fi => fi.href === item.href)) {
        finalItems.push(item);
      }
    });
    
    // Ensure Profile has UserCircle icon if it's present
    // Ensure Dashboard has Home icon if it's present
    finalItems = finalItems.map(item => {
        if (item.href === '/profile') return {...item, icon: UserCircle};
        if (item.href === '/dashboard' && userRole !== 'ADMIN') return {...item, icon: Home}; // Admin dashboard has its own icon
        if (item.href === '/admin/dashboard' && userRole === 'ADMIN') return {...item, icon: School};
        return item;
    });
    
    // If after prioritization, dashboard isn't first for non-admins, move it there if it exists.
    if (userRole !== 'ADMIN') {
        const dashboardIndex = finalItems.findIndex(item => item.href === '/dashboard');
        if (dashboardIndex > 0) {
            const [dashboardItem] = finalItems.splice(dashboardIndex, 1);
            finalItems.unshift(dashboardItem);
        }
    } else { // For ADMIN, ensure Admin Dashboard is first
        const adminDashboardIndex = finalItems.findIndex(item => item.href === '/admin/dashboard');
        if (adminDashboardIndex > 0) {
            const [adminDashboardItem] = finalItems.splice(adminDashboardIndex, 1);
            finalItems.unshift(adminDashboardItem);
        } else if (adminDashboardIndex === -1) { // If admin dashboard wasn't picked by priority, add it
            const adminDashLink = NAV_LINKS.find(item => item.href === '/admin/dashboard' && item.roles.includes(userRole));
            if (adminDashLink && finalItems.length < 5) {
                finalItems.unshift({...adminDashLink, icon: School});
            }
        }
    }


    return finalItems.slice(0, 5); // Ensure max 5 items
  };
  
  const mobileNavItems = getFilteredMobileNavItems();


  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-stretch h-[var(--mobile-bottom-nav-height)] bg-card border-t border-border shadow-top-md">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && !(item.href === '/dashboard' && pathname.startsWith('/admin')) && pathname.startsWith(item.href));
        const IconComponent = item.icon || Home; 

        return (
          <Link key={item.href} href={item.href} passHref>
            <div className={cn(
              "flex flex-col items-center justify-center h-full px-1 text-muted-foreground hover:text-primary transition-colors w-full pt-1 pb-0.5 group", 
              isActive && "text-primary"
            )}>
              <IconComponent className="h-5 w-5 mb-0.5 transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-medium truncate w-full text-center leading-tight">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

    