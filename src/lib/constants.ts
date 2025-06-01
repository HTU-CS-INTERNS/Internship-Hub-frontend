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
  LogOut,
  GraduationCap, // Added import
  CheckSquare,   // Added import
  FileCheck      // Added import
} from 'lucide-react';
import type { UserRole } from '@/types';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
  children?: NavItem[];
}

export const USER_ROLES: Record<UserRole, string> = {
  STUDENT: 'Student',
  LECTURER: 'Lecturer',
  SUPERVISOR: 'Company Supervisor',
  HOD: 'Head of Department',
};

export const NAV_LINKS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD'] },
  { href: '/profile', label: 'Profile', icon: User, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD'] },
  { 
    href: '/tasks', 
    label: 'Daily Tasks', 
    icon: ClipboardList, 
    roles: ['STUDENT'],
    children: [
      { href: '/tasks/new', label: 'Declare Task', icon: ClipboardList, roles: ['STUDENT'] },
      { href: '/tasks/history', label: 'Task History', icon: ClipboardList, roles: ['STUDENT'] },
    ]
  },
  { 
    href: '/reports', 
    label: 'Work Reports', 
    icon: FileText, 
    roles: ['STUDENT'],
    children: [
      { href: '/reports/new', label: 'Submit Report', icon: FileText, roles: ['STUDENT'] },
      { href: '/reports/history', label: 'Report History', icon: FileText, roles: ['STUDENT'] },
    ]
  },
  { href: '/communication', label: 'Messages', icon: MessageSquare, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD'] },
  { 
    href: '/assignments', 
    label: 'Assignments', 
    icon: Users, 
    roles: ['LECTURER', 'HOD'],
    children: [
      { href: '/assignments/manage', label: 'Manage Assignments', icon: Users, roles: ['LECTURER', 'HOD'] },
      { href: '/assignments/students', label: 'My Students', icon: GraduationCap, roles: ['LECTURER'] },
    ]
  },
  { 
    href: '/interns', 
    label: 'Interns', 
    icon: Briefcase, 
    roles: ['SUPERVISOR'],
    children: [
      { href: '/interns/manage', label: 'Manage Interns', icon: Briefcase, roles: ['SUPERVISOR'] },
      { href: '/interns/approve-tasks', label: 'Approve Tasks', icon: CheckSquare, roles: ['SUPERVISOR'] },
      { href: '/interns/approve-reports', label: 'Approve Reports', icon: FileCheck, roles: ['SUPERVISOR'] },
    ]
  },
  { 
    href: '/department', 
    label: 'Department', 
    icon: Building, 
    roles: ['HOD'],
    children: [
      { href: '/department/overview', label: 'Overview', icon: Building, roles: ['HOD'] },
      { href: '/department/lecturers', label: 'Manage Lecturers', icon: Users, roles: ['HOD'] },
    ]
  },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['LECTURER', 'SUPERVISOR', 'HOD'] },
];

export const BOTTOM_NAV_LINKS: NavItem[] = [
    { href: '/settings', label: 'Settings', icon: Settings, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD'] },
    // Logout is typically handled by a button, not a nav link, but included for structure
    // { href: '/logout', label: 'Logout', icon: LogOut, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD'] },
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
