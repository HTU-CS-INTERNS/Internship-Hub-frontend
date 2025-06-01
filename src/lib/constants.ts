
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
  UserCircle,
  Bell,
  Mail,
  Palette,
  ShieldCheck,
  BookOpen,
  TrendingUp,
  Landmark, // For University Structure
  School // For Admin Dashboard
} from 'lucide-react';
import type { UserRole, ScoringMetric, Faculty as AppFaculty, Department as AppDepartment } from '@/types'; // Renamed to avoid conflict

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
  children?: NavItem[];
  section?: string;
  mobile?: boolean;
}

export const USER_ROLES: Record<UserRole, string> = {
  STUDENT: 'Student',
  LECTURER: 'Lecturer',
  SUPERVISOR: 'Company Supervisor',
  HOD: 'Head of Department',
  ADMIN: 'Administrator',
};

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
    roles: ['STUDENT'],
    section: "Main",
    mobile: true
  },
  { href: '/company', label: 'My Company', icon: Building, roles: ['STUDENT'], section: "Main", mobile: false },

  // Tools Section
  { href: '/check-in', label: 'Check-in', icon: MapPin, roles: ['STUDENT'], section: "Tools", mobile: true },
  { href: '/schedule', label: 'My Schedule', icon: CalendarDays, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD'], section: "Tools", mobile: false },
  { href: '/communication', label: 'Feedback Hub', icon: MessageSquare, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD'], section: "Tools", mobile: true },

  // Management for other roles
  {
    href: '/interns',
    label: 'My Interns',
    icon: Briefcase,
    roles: ['SUPERVISOR'],
    section: "Management",
    mobile: true
  },
  {
    href: '/assignments',
    label: 'Student Assignments',
    icon: Users,
    roles: ['LECTURER', 'HOD'],
    section: "Management",
    mobile: true
  },
  {
    href: '/department-ops',
    label: 'Department Ops',
    icon: GraduationCap,
    roles: ['HOD'],
    section: "Management"
  },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['LECTURER', 'SUPERVISOR', 'HOD', 'ADMIN'], section: "Management" }, // Admin can also view analytics

  // Admin Section
  { href: '/admin/dashboard', label: 'Admin Dashboard', icon: School, roles: ['ADMIN'], section: "Administration" },
  { href: '/admin/university-structure', label: 'University Structure', icon: Landmark, roles: ['ADMIN'], section: "Administration" },
  { href: '/admin/user-management', label: 'User Management', icon: UserCog, roles: ['ADMIN'], section: "Administration" },
];

export const BOTTOM_NAV_LINKS: NavItem[] = [
    { href: '/profile', label: 'Profile', icon: UserCog, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD', 'ADMIN'], section: "Settings", mobile: true },
    { href: '/settings', label: 'Settings', icon: Settings, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD', 'ADMIN'], section: "Settings" },
];

export const FACULTIES: AppFaculty[] = [
  { id: 'F001', name: 'Faculty of Engineering' },
  { id: 'F002', name: 'Faculty of Business and Management' },
  { id: 'F003', name: 'Faculty of Information Technology' },
  { id: 'F004', name: 'Faculty of Arts and Social Sciences' },
  { id: 'F_MOCK', name: 'Faculty of Mock Data'},
];

export const DEPARTMENTS: AppDepartment[] = [
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

export const DUMMY_STUDENTS_DATA = [
  { id: 'std1', name: 'Alice Wonderland', email: 'alice@example.com', department: 'Software Engineering', faculty: 'Faculty of Engineering', avatarUrl: 'https://placehold.co/150x150.png' },
  { id: 'std2', name: 'Bob The Intern', email: 'bob@example.com', department: 'Mechanical Engineering', faculty: 'Faculty of Engineering', avatarUrl: 'https://placehold.co/150x150.png' },
  { id: 'std3', name: 'Charlie Brown', email: 'charlie@example.com', department: 'Marketing', faculty: 'Faculty of Business', avatarUrl: 'https://placehold.co/150x150.png' },
  { id: 'std4', name: 'Diana Prince', email: 'diana@example.com', department: 'Software Engineering', faculty: 'Faculty of Engineering', avatarUrl: 'https://placehold.co/150x150.png' },
];

export const SCORING_METRICS: ScoringMetric[] = [
  { id: 'technical_skills', label: 'Technical Skills', description: 'Proficiency in relevant tools and technologies.' },
  { id: 'communication', label: 'Communication', description: 'Clarity and effectiveness in verbal and written communication.' },
  { id: 'problem_solving', label: 'Problem Solving', description: 'Ability to identify issues and develop effective solutions.' },
  { id: 'professionalism', label: 'Professionalism', description: 'Conduct, attitude, and adherence to workplace ethics.' },
  { id: 'timeliness_initiative', label: 'Timeliness & Initiative', description: 'Punctuality, meeting deadlines, and proactiveness.' },
];
