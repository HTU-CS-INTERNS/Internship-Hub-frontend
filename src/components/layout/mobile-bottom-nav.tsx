
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListChecks, MapPin, UserCircle, CalendarDays, Briefcase, MessageSquare, Users, GraduationCap, BarChart3, School, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole, NavItem } from '@/types';
import { NAV_LINKS, BOTTOM_NAV_LINKS } from '@/lib/constants'; 

interface MobileBottomNavProps {
  userRole: UserRole;
}

export default function MobileBottomNav({ userRole }: MobileBottomNavProps) {
  const pathname = usePathname();

  const getFilteredMobileNavItems = (): NavItem[] => {
    let potentialItems = [
        ...NAV_LINKS.filter(item => item.mobile && item.roles.includes(userRole)),
        ...BOTTOM_NAV_LINKS.filter(item => item.mobile && item.roles.includes(userRole))
    ];
    
    const primaryMobileItemsMap: Record<UserRole, string[]> = {
      STUDENT: ['/dashboard', '/student/tasks', '/student/reports', '/student/check-in', '/profile'],
      LECTURER: ['/dashboard', '/assignments', '/communication', '/schedule', '/profile'],
      SUPERVISOR: ['/dashboard', '/supervisor/interns', '/communication', '/schedule', '/profile'],
      HOD: ['/dashboard', '/department-ops', '/assignments', '/analytics', '/profile'],
      ADMIN: ['/admin/dashboard', '/admin/user-management', '/admin/university-structure', '/analytics', '/profile'],
    };

    const roleSpecificHrefs = primaryMobileItemsMap[userRole] || ['/dashboard', '/profile'];
    let finalItems: NavItem[] = [];

    roleSpecificHrefs.forEach(href => {
      if (finalItems.length < 5) {
        const item = [...NAV_LINKS, ...BOTTOM_NAV_LINKS].find(link => link.href === href && link.roles.includes(userRole));
        if (item && !finalItems.some(fi => fi.href === item.href)) {
          finalItems.push(item);
        }
      }
    });

    potentialItems.forEach(item => {
      if (finalItems.length < 5 && !finalItems.some(fi => fi.href === item.href)) {
        finalItems.push(item);
      }
    });
    
    finalItems = finalItems.map(item => {
        if (item.href === '/profile') return {...item, icon: UserCircle};
        if (item.href === '/dashboard' && userRole !== 'ADMIN') return {...item, icon: Home};
        if (item.href === '/admin/dashboard' && userRole === 'ADMIN') return {...item, icon: School};
        // Ensuring student specific icons if they make it to the nav
        if (item.href === '/student/tasks') return {...item, icon: ListChecks};
        if (item.href === '/student/reports') return {...item, icon: FileText};
        if (item.href === '/student/check-in') return {...item, icon: MapPin};
        return item;
    });
    
    if (userRole !== 'ADMIN') {
        const dashboardIndex = finalItems.findIndex(item => item.href === '/dashboard');
        if (dashboardIndex > 0) {
            const [dashboardItem] = finalItems.splice(dashboardIndex, 1);
            finalItems.unshift(dashboardItem);
        }
    } else { 
        const adminDashboardIndex = finalItems.findIndex(item => item.href === '/admin/dashboard');
        if (adminDashboardIndex > 0) {
            const [adminDashboardItem] = finalItems.splice(adminDashboardIndex, 1);
            finalItems.unshift(adminDashboardItem);
        } else if (adminDashboardIndex === -1) { 
            const adminDashLink = NAV_LINKS.find(item => item.href === '/admin/dashboard' && item.roles.includes(userRole));
            if (adminDashLink && finalItems.length < 5) {
                finalItems.unshift({...adminDashLink, icon: School});
            } else if (adminDashLink && finalItems.length >=5) { // if full, replace last one
                 finalItems.pop();
                 finalItems.unshift({...adminDashLink, icon: School});
            }
        }
    }
    return finalItems.slice(0, 5);
  };
  
  const mobileNavItems = getFilteredMobileNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center h-[var(--mobile-bottom-nav-height)] bg-primary text-primary-foreground shadow-top-md">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href || 
                         (item.href !== '/' && 
                          !(item.href === '/dashboard' && pathname.startsWith('/admin')) && 
                          pathname.startsWith(item.href)
                         );
        const IconComponent = item.icon || Home; 

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center h-full flex-1 p-1 group focus:outline-none focus:ring-1 focus:ring-primary-foreground/50 focus:rounded-md transition-colors duration-150",
              isActive ? "text-primary-foreground" : "text-primary-foreground/60 hover:text-primary-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <IconComponent 
              className={cn(
                  "h-6 w-6 mb-0.5 transition-transform duration-150",
                  isActive ? "scale-110" : "group-hover:scale-105"
              )} 
            />
            <span className={cn(
              "text-[10px] truncate w-full text-center leading-tight",
              isActive ? "font-semibold" : "font-normal"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
