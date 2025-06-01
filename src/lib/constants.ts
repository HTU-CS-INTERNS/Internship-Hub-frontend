
import type { LucideIcon } from 'lucide-react';
import { 
  LayoutDashboard, 
  User, 
  ClipboardList, 
  FileText, 
  MessageSquare, 
  Users, 
  Briefcase, 
  Building, 
  BarChart3, 
  Settings, 
  GraduationCap,
  CheckSquare,
  FileCheck,
  Home,
  ListChecks, // Used for Daily Tasks in mockup
  MapPin, // Used for Check-in in mockup
  CalendarDays, // Used for Schedule in mockup
  UserCog, // Used for Profile (desktop)
  UserCircle, // For mobile profile & general user
  Bell, 
  Mail,
  Palette, // For Appearance settings
  ShieldCheck, // For Privacy & Security settings
  BookOpen // For My Company page
} from 'lucide-react';
import type { UserRole } from '@/types';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
  children?: NavItem[];
  section?: string; 
  mobile?: boolean; // To show on mobile bottom nav (first 4-5 items)
}

export const USER_ROLES: Record<UserRole, string> = {
  STUDENT: 'Student',
  LECTURER: 'Lecturer',
  SUPERVISOR: 'Company Supervisor',
  HOD: 'Head of Department',
};

// Sidebar Navigation Structure (Desktop)
export const NAV_LINKS: NavItem[] = [
  // Main Section
  { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD'], section: "Main", mobile: true },
  { 
    href: '/tasks', 
    label: 'Daily Tasks', 
    icon: ListChecks, 
    roles: ['STUDENT'],
    section: "Main",
    mobile: true
  },
  { 
    href: '/reports', 
    label: 'Reports', 
    icon: FileText, 
    roles: ['STUDENT'], // Also for SUPERVISOR/LECTURER to view
    section: "Main",
    mobile: true // Student might want quick access
  },
  { href: '/company', label: 'My Company', icon: Building, roles: ['STUDENT'], section: "Main", mobile: false }, 

  // Tools Section
  { href: '/check-in', label: 'Check-in', icon: MapPin, roles: ['STUDENT'], section: "Tools", mobile: true }, 
  { href: '/schedule', label: 'My Schedule', icon: CalendarDays, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD'], section: "Tools", mobile: false }, 
  { href: '/communication', label: 'Feedback Hub', icon: MessageSquare, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD'], section: "Tools" }, 

  // Management for other roles
  { 
    href: '/assignments', 
    label: 'Assignments', 
    icon: Users, 
    roles: ['LECTURER', 'HOD'],
    section: "Management"
  },
  { 
    href: '/interns', 
    label: 'My Interns', 
    icon: Briefcase, 
    roles: ['SUPERVISOR'], // Renamed from 'Interns' for clarity in sidebar
    section: "Management"
  },
  { 
    href: '/department-ops', // Example, actual link TBD
    label: 'Department Ops', 
    icon: GraduationCap, // Changed from Building to avoid conflict with Company
    roles: ['HOD'],
    section: "Management"
  },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['LECTURER', 'SUPERVISOR', 'HOD'], section: "Management" },
];

export const BOTTOM_NAV_LINKS: NavItem[] = [
    { href: '/profile', label: 'Profile', icon: UserCog, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD'], section: "Settings", mobile: true },
    { href: '/settings', label: 'Settings', icon: Settings, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD'], section: "Settings" },
];


export const FACULTIES = [
  { id: 'F001', name: 'Faculty of Engineering' },
  { id: 'F002', name: 'Faculty of Business and Management' },
  { id: 'F003', name: 'Faculty of Information Technology' },
  { id: 'F004', name: 'Faculty of Arts and Social Sciences' },
  { id: 'F_MOCK', name: 'Faculty of Mock Data'},
];

export const DEPARTMENTS = [
  { id: 'D001', name: 'Mechanical Engineering', facultyId: 'F001' },
  { id: 'D002', name: 'Civil Engineering', facultyId: 'F001' },
  { id: 'D003', name: 'Marketing', facultyId: 'F002' },
  { id: 'D004', name: 'Finance', facultyId: 'F002' },
  { id: 'D005', name: 'Software Engineering', facultyId: 'F003' },
  { id: 'D006', name: 'Cybersecurity', facultyId: 'F003' },
  { id: 'D007', name: 'Psychology', facultyId: 'F004' },
  { id: 'D008', name: 'Sociology', facultyId: 'F004' },
  { id: 'D_MOCK', name: 'Department of Mock Data', facultyId: 'F_MOCK' },
];
