'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { NAV_LINKS, BOTTOM_NAV_LINKS, USER_ROLES } from '@/lib/constants';
import type { NavItem, UserRole } from '@/types';
import { GraduationCap, LogOut } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


interface AppSidebarProps {
  userRole: UserRole;
}

export default function AppSidebar({ userRole }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openAccordionItems, setOpenAccordionItems] = React.useState<string[]>([]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem('userRole');
    }
    router.push('/login');
  };

  const filteredNavLinks = NAV_LINKS.filter(link => link.roles.includes(userRole));
  const filteredBottomNavLinks = BOTTOM_NAV_LINKS.filter(link => link.roles.includes(userRole));

  const renderNavItem = (item: NavItem, isSubItem: boolean = false) => {
    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
    
    if (item.children && item.children.length > 0) {
      const filteredChildren = item.children.filter(child => child.roles.includes(userRole));
      if (filteredChildren.length === 0) return null;

      return (
        <AccordionItem value={item.label} key={item.label} className="border-none">
          <AccordionTrigger 
            className={`w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md px-2 py-2 text-sm font-medium ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground'} [&[data-state=open]>svg]:text-primary`}
            onClick={() => {
              setOpenAccordionItems(prev => 
                prev.includes(item.label) ? prev.filter(i => i !== item.label) : [...prev, item.label]
              );
            }}
          >
            <item.icon className={`mr-2 h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
            <span className="truncate">{item.label}</span>
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-0 pl-4">
            <SidebarMenuSub>
              {filteredChildren.map(child => (
                <SidebarMenuSubItem key={child.href}>
                  <Link href={child.href} passHref legacyBehavior>
                    <SidebarMenuSubButton
                      isActive={pathname === child.href || pathname.startsWith(child.href)}
                      className="w-full"
                    >
                      {child.icon && <child.icon className={`mr-2 h-4 w-4 ${pathname.startsWith(child.href) ? 'text-primary' : ''}`} />}
                      <span className="truncate">{child.label}</span>
                    </SidebarMenuSubButton>
                  </Link>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </AccordionContent>
        </AccordionItem>
      );
    }

    const ButtonComponent = isSubItem ? SidebarMenuSubButton : SidebarMenuButton;

    return (
      <SidebarMenuItem key={item.href}>
        <Link href={item.href} passHref legacyBehavior>
          <ButtonComponent 
            isActive={isActive}
            className="w-full"
            tooltip={{ children: item.label, side: 'right', className: 'font-body' }}
          >
            <item.icon className={`mr-2 h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
            <span className="truncate">{item.label}</span>
          </ButtonComponent>
        </Link>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="shadow-md">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <GraduationCap className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
          <span className="font-headline text-xl font-bold text-primary group-hover:text-primary/80 transition-colors group-data-[collapsible=icon]:hidden">
            InternshipTrack
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <Accordion type="multiple" value={openAccordionItems} onValueChange={setOpenAccordionItems} className="w-full space-y-1">
          {filteredNavLinks.map(item => renderNavItem(item))}
        </Accordion>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-2 space-y-1">
        <SidebarMenu>
            {filteredBottomNavLinks.map(item => renderNavItem(item))}
            <SidebarMenuItem>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive group-data-[collapsible=icon]:justify-center"
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
