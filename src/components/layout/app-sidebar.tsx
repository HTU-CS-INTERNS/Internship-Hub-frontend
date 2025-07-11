
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { NAV_LINKS, BOTTOM_NAV_LINKS, USER_ROLES } from '@/lib/constants';
import type { NavItem, UserRole } from '@/types';
import { LogOut, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';

const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

interface AppSidebarProps {
  userRole: UserRole;
}

export default function AppSidebar({ userRole }: AppSidebarProps) {
  const pathname = usePathname();
  const { toggleSidebar, state: sidebarState, open: sidebarOpen } = useSidebar();
  const { user, logout } = useAuth();

  const navSections = ["Main", "Tools", "Management", "Administration", "Settings"];

  const renderNavItemsForSection = (section: string, links: NavItem[]) => {
    const sectionLinks = links.filter(link => link.section === section && link.roles.includes(userRole));
    if (sectionLinks.length === 0) return null;

    return (
      <React.Fragment key={section}>
        <div className="px-4 mt-4 mb-2 group-data-[collapsible=icon]:hidden">
          <span className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
            {section}
          </span>
        </div>
         <div className="px-2 group-data-[collapsible=icon]:px-0.5 group-data-[collapsible=icon]:mt-2">
            <SidebarMenu>
            {sectionLinks.map(item => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                <SidebarMenuItem key={item.href}>
                    <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                        isActive={isActive}
                        className="w-full group-data-[collapsible=icon]:justify-center rounded-lg"
                        tooltip={{ children: item.label, side: 'right', className: 'font-body bg-card text-card-foreground border-border' }}
                    >
                        <item.icon className={`h-5 w-5 ${isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/80'} group-hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:mx-auto`} />
                        <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                );
            })}
            </SidebarMenu>
        </div>
      </React.Fragment>
    );
  };

  if (!user) {
    // Or a loading skeleton
    return null;
  }
  
  const userName = `${user.first_name} ${user.last_name}`;

  const allLinks = [...NAV_LINKS, ...BOTTOM_NAV_LINKS];

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="shadow-lg bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border flex items-center justify-between group-data-[collapsible=icon]:justify-center">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center shadow-md p-1.5">
            <GraduationCap className="h-full w-full text-primary-foreground" />
          </div>
          <span className="font-headline text-xl font-bold text-primary-foreground group-hover:text-primary-foreground/80 transition-colors group-data-[collapsible=icon]:hidden">
            InternHub
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-0 flex-1 overflow-y-auto">
        <div className="p-4 border-b border-sidebar-border group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:border-b-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center group-data-[collapsible=icon]:hidden">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar_url || `https://placehold.co/100x100.png?text=${getInitials(userName)}`} alt={userName} data-ai-hint="person portrait"/>
                        <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-lg">{getInitials(userName)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                        <div className="text-sm font-medium text-sidebar-foreground">{userName}</div>
                        <div className="text-xs text-sidebar-foreground/70">{USER_ROLES[userRole]}</div>
                    </div>
                </div>
                 <div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:py-2">
                    <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md">
                        {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </Button>
                </div>
            </div>
        </div>

        {navSections.map(section => renderNavItemsForSection(section, allLinks))}
      </SidebarContent>

      <SidebarSeparator className="bg-sidebar-border" />
      <SidebarFooter className="p-2">
        <SidebarMenu>
            <SidebarMenuItem>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center rounded-lg"
                    onClick={logout}
                    title="Logout"
                >
                    <LogOut className="mr-2 h-5 w-5 group-data-[collapsible=icon]:mr-0 text-sidebar-foreground/80 group-hover:text-sidebar-accent-foreground" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Logout</span>
                </Button>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
