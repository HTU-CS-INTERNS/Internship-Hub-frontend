
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
  Landmark, 
  School,
  ShieldAlert
} from 'lucide-react';
import type { UserRole, ScoringMetric, Faculty as AppFaculty, Department as AppDepartment, DailyTask, DailyReport } from '@/types'; 

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
  children?: NavItem[];
  section?: string;
  mobile?: boolean;
}

export const USER_ROLES: Record<string, string> = {
  STUDENT: 'Student',
  LECTURER: 'Lecturer',
  SUPERVISOR: 'Industrial Supervisor',
  HOD: 'Head of Department',
  ADMIN: 'Administrator',
};

export const NAV_LINKS: NavItem[] = [
  // Main Section
  {
    href: '/student/dashboard',
    label: 'My Dashboard',
    icon: LayoutDashboard,
    roles: ['STUDENT'],
    section: "Main",
    mobile: true
  },
  {
    href: '/student/tasks',
    label: 'Daily Tasks',
    icon: ListChecks,
    roles: ['STUDENT'],
    section: "Main",
    mobile: true
  },
  {
    href: '/student/reports',
    label: 'Daily Reports',
    icon: FileText,
    roles: ['STUDENT'],
    section: "Main",
    mobile: true
  },
  {
    href: '/student/attendance',
    label: 'Attendance',
    icon: CalendarDays,
    roles: ['STUDENT'],
    section: "Main",
    mobile: true
  },
  { 
    href: '/student/company', 
    label: 'My Company', 
    icon: Building, 
    roles: ['STUDENT'], 
    section: "Main", 
    mobile: false 
  },
  {
    href: '/student/internship',
    label: 'My Internship',
    icon: Briefcase,
    roles: ['STUDENT'],
    section: "Main",
    mobile: true
  },
  {
    href: '/student/profile',
    label: 'Internship Profile',
    icon: User,
    roles: ['STUDENT'],
    section: "Main",
    mobile: true
  },

  // Tools Section
  { 
    href: '/student/check-in', 
    label: 'Check-in', 
    icon: MapPin, 
    roles: ['STUDENT'], 
    section: "Tools", 
    mobile: true 
  },
  {
    href: '/student/documents',
    label: 'Documents',
    icon: FileCheck,
    roles: ['STUDENT'],
    section: "Tools",
    mobile: true
  },
  // { 
  //   href: '/schedule', 
  //   label: 'My Schedule', 
  //   icon: CalendarDays, 
  //   roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD'], 
  //   section: "Tools", 
  //   mobile: false 
  // },
  // { 
  //   href: '/communication', 
  //   label: 'Feedback Hub', 
  //   icon: MessageSquare, 
  //   roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD', 'ADMIN'], 
  //   section: "Tools", 
  //   mobile: true 
  // },
  {
    href: '/student/evaluations',
    label: 'Evaluations',
    icon: CheckSquare,
    roles: ['STUDENT'],
    section: "Tools",
    mobile: true
  },
  {
    href: '/student/progress',
    label: 'Progress Tracking',
    icon: TrendingUp,
    roles: ['STUDENT'],
    section: "Tools",
    mobile: true
  },

  // Management for other roles
  {
    href: '/supervisor/interns', 
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
  { 
    href: '/analytics', 
    label: 'Analytics', 
    icon: BarChart3, 
    roles: ['LECTURER', 'SUPERVISOR', 'HOD', 'ADMIN'], 
    section: "Management" 
  },

  // Admin Section
  { 
    href: '/admin/dashboard', 
    label: 'Admin Dashboard', 
    icon: School, 
    roles: ['ADMIN'], 
    section: "Administration" 
  },
  { 
    href: '/admin/university-structure', 
    label: 'University Structure', 
    icon: Landmark, 
    roles: ['ADMIN'], 
    section: "Administration" 
  },
  { 
    href: '/admin/user-management', 
    label: 'User Management', 
    icon: UserCog, 
    roles: ['ADMIN'], 
    section: "Administration" 
  },
  { 
    href: '/admin/student-management', 
    label: 'Student Management', 
    icon: Users, 
    roles: ['ADMIN'], 
    section: "Administration" 
  },
  { 
    href: '/admin/internship-management', 
    label: 'Internship Management', 
    icon: Briefcase, 
    roles: ['ADMIN'], 
    section: "Administration" 
  },
  { 
    href: '/admin/reported-abuse', 
    label: 'Reported Issues', 
    icon: ShieldAlert, 
    roles: ['ADMIN'], 
    section: 'Administration' 
  },
  { 
    href: '/admin/settings', 
    label: 'System Settings', 
    icon: Settings, 
    roles: ['ADMIN'], 
    section: "Administration" 
  },
];

export const BOTTOM_NAV_LINKS: NavItem[] = [
    { href: '/student/profile', label: 'My Profile', icon: UserCircle, roles: ['STUDENT'], section: "Settings", mobile: true },
    { href: '/profile', label: 'My Profile', icon: UserCircle, roles: ['LECTURER', 'SUPERVISOR', 'HOD', 'ADMIN'], section: "Settings", mobile: true },
    { href: '/notifications', label: 'Notifications', icon: Bell, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD', 'ADMIN'], section: "Settings", mobile: true },
    { href: '/settings', label: 'Settings', icon: Settings, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD', 'ADMIN'], section: "Settings" },
    { href: '/help', label: 'Help & Support', icon: BookOpen, roles: ['STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD', 'ADMIN'], section: "Settings" },
];

export const FACULTIES: AppFaculty[] = [
  { id: 'F001', name: 'Faculty of Engineering' },
  { id: 'F002', name: 'Faculty of Business and Management' },
  { id: 'F003', name: 'Faculty of Information Technology' },
];

export const DEPARTMENTS: AppDepartment[] = [
  { id: 'D001', name: 'Civil Engineering', facultyId: 'F001' },
  { id: 'D002', name: 'Mechanical Engineering', facultyId: 'F001' },
  { id: 'D003', name: 'Marketing', facultyId: 'F002' },
  { id: 'D004', name: 'Accounting and Finance', facultyId: 'F002' },
  { id: 'D005', name: 'Software Engineering', facultyId: 'F003' },
  { id: 'D006', name: 'Cybersecurity', facultyId: 'F003' },
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

export const DUMMY_REPORTS: (DailyReport & { title?: string; challengesFaced?: string; securePhotoUrl?: string; attachments?: any[]; supervisorComments?: string })[] = [
  { 
    id: 'report1', 
    date: '2024-07-26', 
    title: 'Weekly Auth Module Summary',
    description: 'Weekly summary of authentication module progress. Focused on JWT implementation and secure endpoint testing. Reviewed security protocols and updated documentation.', 
    outcomes: 'Module 70% complete. Security review passed.', 
    learningObjectives: 'Advanced JWT, security best practices, technical documentation.', 
    studentId: 'stu1', 
    status: 'APPROVED',
    challengesFaced: "Minor issues with token refresh logic, resolved by adjusting expiration strategy.",
    attachments: [],
    securePhotoUrl: 'https://placehold.co/600x400.png',
    supervisorComments: "Good progress this week, Alice. The JWT implementation looks solid. Keep up the great work!"
  },
  { 
    id: 'report2', 
    date: '2024-07-27', 
    title: 'Mid-Internship Presentation Prep',
    description: 'Mid-internship review presentation preparation and content finalization for all key sections. Practiced delivery and timing.', 
    outcomes: 'Presentation draft ready. Confident in delivery.', 
    learningObjectives: 'Presentation skills, summarizing technical work for diverse audiences.', 
    studentId: 'stu1', 
    status: 'SUBMITTED',
    challengesFaced: "Condensing all work into a short presentation was challenging.",
    attachments: [],
    supervisorComments: "Looking forward to seeing the presentation."
  },
  { 
    id: 'report3', 
    date: '2024-07-25', 
    title: 'New Feature X Planning',
    description: 'Initial setup and planning for the new feature X, including requirement gathering, user story creation, and timeline estimation.', 
    outcomes: 'Project plan created. User stories documented.', 
    learningObjectives: 'Agile planning, requirement elicitation techniques.', 
    studentId: 'stu1', 
    status: 'PENDING',
    challengesFaced: "Ambiguity in initial requirements, clarified with product manager.",
    securePhotoUrl: 'https://placehold.co/600x400.png'
  },
  { 
    id: 'report4', 
    date: '2024-07-24', 
    title: 'Bug Fixing Sprint v1.2',
    description: 'Bug fixing for version 1.2 release, addressing critical issues reported by QA. Focused on payment module bugs.', 
    outcomes: 'Critical bugs in payment module resolved. Test coverage improved.', 
    learningObjectives: 'Advanced debugging techniques, payment gateway integration nuances.', 
    studentId: 'stu1', 
    status: 'REJECTED',
    challengesFaced: "One particularly elusive bug took significant time to trace and fix.",
    supervisorComments: "Some non-critical bugs remain. Please address them and resubmit the affected module for testing."
  },
];


export const DUMMY_TASKS: DailyTask[] = [
  { id: 'task1', date: '2024-07-28', description: 'Develop user authentication module.', outcomes: 'Authentication flow completed.', learningObjectives: 'Learned JWT implementation.', studentId: 'stu1', status: 'APPROVED', departmentOutcomeLink: "DO1.2" },
  { id: 'task2', date: '2024-07-29', description: 'Design database schema for posts.', outcomes: 'Schema designed and reviewed.', learningObjectives: 'Understanding of relational databases.', studentId: 'stu1', status: 'SUBMITTED' },
  { id: 'task3', date: '2024-07-30', description: 'Write API documentation.', outcomes: 'Initial draft completed.', learningObjectives: 'API documentation best practices.', studentId: 'stu1', status: 'PENDING' },
  { id: 'task4', date: '2024-07-27', description: 'Refactor old legacy code module for payments.', outcomes: 'Improved performance by 15%.', learningObjectives: 'Code refactoring strategies.', studentId: 'stu1', status: 'REJECTED' },
];

    