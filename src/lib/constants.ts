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
  ListChecks,
  MapPin,
  CalendarDays,
  UserCog,
  Bell, // Added for header
  Mail // Added for header
} from 'lucide-react';
import type { UserRole } from '@/types';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
  children?: NavItem[];
  section?: string; // For grouping in sidebar
}

export const USER_ROLES: Record<UserRole, string> = {
  STUDENT: 'Student',
  LECTURER: 'Lecturer',
  SUPERVISOR: 'Company Supervisor',
  HOD: 'Head of Department',
};

// Adapted to match mockup structure and icons, using Lucide
export const NAV_LINKS: NavItem[] = [
  // Main Section
  { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD'], section: "Main" },
  { 
    href: '/tasks', 
    label: 'Daily Tasks', 
    icon: ListChecks, // fas fa-tasks
    roles: ['STUDENT'],
    section: "Main"
    // children: [
    //   { href: '/tasks/new', label: 'Declare Task', icon: PlusCircle, roles: ['STUDENT'] },
    // ]
  },
  { 
    href: '/reports', 
    label: 'Reports', 
    icon: FileText, // fas fa-file-alt
    roles: ['STUDENT'],
    section: "Main"
    // children: [
    //   { href: '/reports/new', label: 'Submit Report', icon: PlusCircle, roles: ['STUDENT'] },
    // ]
  },
  { href: '/company', label: 'Company', icon: Building, roles: ['STUDENT'], section: "Main" }, // Placeholder, as Company page might not exist yet for student

  // Tools Section
  { href: '/check-in', label: 'Check-in', icon: MapPin, roles: ['STUDENT'], section: "Tools" }, // Placeholder
  { href: '/schedule', label: 'Schedule', icon: CalendarDays, roles: ['STUDENT', 'LECTURER'], section: "Tools" }, // Placeholder
  { href: '/communication', label: 'Feedback', icon: MessageSquare, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD'], section: "Tools" }, // Renamed from 'Messages' to 'Feedback' per mockup

  // Management for other roles (simplified for now, can be expanded)
  { 
    href: '/assignments', 
    label: 'Assignments', 
    icon: Users, 
    roles: ['LECTURER', 'HOD'],
    section: "Management"
  },
  { 
    href: '/interns', 
    label: 'Interns', 
    icon: Briefcase, 
    roles: ['SUPERVISOR'],
    section: "Management"
  },
  { 
    href: '/department', 
    label: 'Department Ops', // More descriptive for HOD
    icon: Building, 
    roles: ['HOD'],
    section: "Management"
  },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['LECTURER', 'SUPERVISOR', 'HOD'], section: "Management" },
];

export const BOTTOM_NAV_LINKS: NavItem[] = [
    { href: '/profile', label: 'Profile', icon: UserCog, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD'], section: "Settings" },
    { href: '/settings', label: 'Settings', icon: Settings, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD'], section: "Settings" },
];

export const FACULTIES = [
  { id: 'F001', name: 'Faculty of Engineering' },
  { id: 'F002', name: 'Faculty of Business and Management' },
  { id: 'F003', name: 'Faculty of Information Technology' },
  { id: 'F004', name: 'Faculty of Arts and Social Sciences' },
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
];
