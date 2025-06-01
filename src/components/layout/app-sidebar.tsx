
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger, // Import SidebarTrigger
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { NAV_LINKS, BOTTOM_NAV_LINKS, USER_ROLES } from '@/lib/constants';
import type { NavItem, UserRole } from '@/types';
import { GraduationCap, LogOut, UserCircle, PanelLeft } from 'lucide-react'; // Added UserCircle & PanelLeft
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Dummy user data - replace with actual user data from context/auth
const DUMMY_USER = {
  name: 'John Doe', // From mockup
  roleSuffix: 'Student', // From mockup
  avatarUrl: 'https://placehold.co/100x100.png', // Placeholder
};
const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();


interface AppSidebarProps {
  userRole: UserRole;
}

export default function AppSidebar({ userRole }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar, state: sidebarState } = useSidebar(); // Get sidebar state

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem('userRole');
      localStorage.removeItem('theme'); // Also clear theme on logout
    }
    document.documentElement.classList.remove('dark');
    router.push('/login');
  };

  const navSections = ["Main", "Tools", "Management", "Settings"]; // Define order

  const renderNavItemsForSection = (section: string, links: NavItem[]) => {
    const sectionLinks = links.filter(link => link.section === section && link.roles.includes(userRole));
    if (sectionLinks.length === 0) return null;

    return (
      <React.Fragment key={section}>
        <div className="px-4 mt-4 mb-2">
          <span className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
            {section}
          </span>
        </div>
        <SidebarMenu>
          {sectionLinks.map(item => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    isActive={isActive}
                    className="w-full group-data-[collapsible=icon]:justify-center"
                    tooltip={{ children: item.label, side: 'right', className: 'font-body bg-card text-card-foreground border-border' }}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-sidebar-primary' : ''} group-data-[collapsible=icon]:mx-auto`} />
                    <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </React.Fragment>
    );
  };
  
  const allLinks = [...NAV_LINKS, ...BOTTOM_NAV_LINKS];

  return (
    <Sidebar 
      collapsible="icon" 
      variant="sidebar" 
      className="shadow-lg bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border flex items-center justify-between group-data-[collapsible=icon]:justify-center">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-sidebar-primary" />
          </div>
          <span className="font-headline text-xl font-bold text-sidebar-primary group-hover:text-sidebar-primary/80 transition-colors group-data-[collapsible=icon]:hidden">
            InternshipTrack
          </span>
        </Link>
        {/* Sidebar toggle button for desktop, hidden when collapsed icon only */}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-sidebar-foreground/70 hover:text-sidebar-foreground group-data-[collapsible=icon]:hidden md:flex hidden">
           <PanelLeft className="h-5 w-5" />
        </Button>
      </SidebarHeader>
      
      <SidebarContent className="p-2 flex-1 overflow-y-auto">
        {/* User Info Section */}
        <div className="p-2 mb-2 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={DUMMY_USER.avatarUrl} alt={DUMMY_USER.name} data-ai-hint="person portrait"/>
                    <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">{getInitials(DUMMY_USER.name)}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                    <div className="text-sm font-medium text-sidebar-foreground">{DUMMY_USER.name}</div>
                    <div className="text-xs text-sidebar-foreground/70">{USER_ROLES[userRole]}</div>
                </div>
            </div>
        </div>
        <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />

        {navSections.map(section => renderNavItemsForSection(section, allLinks))}
      </SidebarContent>
      
      <SidebarSeparator />
      <SidebarFooter className="p-2">
        <SidebarMenu>
            <SidebarMenuItem>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
                    onClick={handleLogout}
                    title="Logout"
                >
                    <LogOut className="mr-2 h-5 w-5 group-data-[collapsible=icon]:mr-0" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Logout</span>
                </Button>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
