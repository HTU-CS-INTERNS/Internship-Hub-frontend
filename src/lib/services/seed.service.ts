
'use client';

import type { UserProfileData, Faculty, Department, HODApprovalQueueItem, DailyTask, DailyReport, CheckIn, AbuseReport } from '@/types';
import { format, subDays, addDays } from 'date-fns';

const USER_STORAGE_KEY = 'internshipHub_users';
const FACULTY_STORAGE_KEY = 'internshipHub_faculties';
const DEPARTMENT_STORAGE_KEY = 'internshipHub_departments';
const PLACEMENT_STORAGE_KEY = 'hodCompanyApprovalQueue';
const TASKS_STORAGE_KEY_PREFIX = 'internshipHub_tasks_';
const REPORTS_STORAGE_KEY_PREFIX = 'internshipHub_reports_';
const CHECKINS_STORAGE_KEY_PREFIX = 'internshipHub_checkins_';
const ABUSE_REPORTS_STORAGE_KEY = 'internshipHub_abuseReports';
const SEED_FLAG_KEY = 'internshipHub_seeded';

// --- SEED DATA DEFINITIONS ---

const seedFaculties: Faculty[] = [
  { id: 'F001', name: 'Faculty of Engineering' },
  { id: 'F002', name: 'Faculty of Business and Management' },
  { id: 'F003', name: 'Faculty of Information Technology' },
];

const seedDepartments: Department[] = [
  { id: 'D001', name: 'Civil Engineering', facultyId: 'F001' },
  { id: 'D002', name: 'Mechanical Engineering', facultyId: 'F001' },
  { id: 'D003', name: 'Marketing', facultyId: 'F002' },
  { id: 'D004', name: 'Accounting and Finance', facultyId: 'F002' },
  { id: 'D005', name: 'Software Engineering', facultyId: 'F003' },
  { id: 'D006', name: 'Cybersecurity', facultyId: 'F003' },
];

const seedUsers: UserProfileData[] = [
  // Admin
  { id: 'admin1', first_name: 'Admin', last_name: 'User', email: 'admin@example.com', role: 'ADMIN', status: 'ACTIVE', phone_number: '+1234567890' },
  
  // HOD
  { id: 'hod1', first_name: 'Prof. Alan', last_name: 'Turing', email: 'hod.it@example.com', role: 'HOD', status: 'ACTIVE', faculty_id: 'F003', department_id: 'D005', phone_number: '+1234567891' },
  
  // Lecturers
  { id: 'lecturer1', first_name: 'Dr. Elara', last_name: 'Vance', email: 'elara.vance@example.com', role: 'LECTURER', status: 'ACTIVE', faculty_id: 'F003', department_id: 'D005', phone_number: '+1234567892' },
  { id: 'lecturer2', first_name: 'Dr. Ian', last_name: 'Malcolm', email: 'ian.malcolm@example.com', role: 'LECTURER', status: 'ACTIVE', faculty_id: 'F001', department_id: 'D002', phone_number: '+1234567893' },
  
  // Supervisors
  { id: 'supervisor1', first_name: 'John', last_name: 'Smith', email: 'john.smith@innovatech.example.com', role: 'SUPERVISOR', status: 'ACTIVE', company_name: 'Innovatech Solutions Inc.', phone_number: '+1234567894' },
  { id: 'supervisor2', first_name: 'Carol', last_name: 'Danvers', email: 'carol.danvers@stark.example.com', role: 'SUPERVISOR', status: 'ACTIVE', company_name: 'Stark Industries', phone_number: '+1234567895' },

  // Students
  { id: 'student1', first_name: 'Alice', last_name: 'Wonderland', email: 'alice.w@example.com', role: 'STUDENT', status: 'ACTIVE', faculty_id: 'F003', department_id: 'D005', phone_number: '+1234567896' },
  { id: 'student2', first_name: 'Bob', last_name: 'Builder', email: 'bob.b@example.com', role: 'STUDENT', status: 'ACTIVE', faculty_id: 'F001', department_id: 'D002', phone_number: '+1234567897' },
  { id: 'student3', first_name: 'Charlie', last_name: 'Brown', email: 'charlie.b@example.com', role: 'STUDENT', status: 'PENDING_ACTIVATION', faculty_id: 'F002', department_id: 'D003', phone_number: '+1234567898' },
];

const seedPlacements: HODApprovalQueueItem[] = [
  { studentId: 'alice.w@example.com', studentName: 'Alice Wonderland', companyName: 'Innovatech Solutions Inc.', supervisorName: 'John Smith', supervisorEmail: 'john.smith@innovatech.example.com', submissionDate: subDays(new Date(), 10).toISOString(), status: 'APPROVED', startDate: new Date().toISOString(), endDate: addDays(new Date(), 90).toISOString() },
  { studentId: 'bob.b@example.com', studentName: 'Bob Builder', companyName: 'Stark Industries', supervisorName: 'Carol Danvers', supervisorEmail: 'carol.danvers@stark.example.com', submissionDate: subDays(new Date(), 5).toISOString(), status: 'APPROVED', startDate: new Date().toISOString(), endDate: addDays(new Date(), 90).toISOString() },
];

const seedTasks_Alice: DailyTask[] = [
    { id: 'task_alice1', date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), description: 'Onboarding session and dev environment setup.', outcomes: 'Local environment fully configured.', learningObjectives: 'Company dev workflow.', studentId: 'alice.w@example.com', status: 'APPROVED', supervisorComments: "Good start Alice!" },
    { id: 'task_alice2', date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), description: 'Initial work on user profile UI component.', outcomes: 'Basic UI structure complete.', learningObjectives: 'React component lifecycle.', studentId: 'alice.w@example.com', status: 'SUBMITTED' },
    { id: 'task_alice3', date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), description: 'Refactor profile UI state management with Zustand.', outcomes: 'State management implemented.', learningObjectives: 'Zustand for state management.', studentId: 'alice.w@example.com', status: 'PENDING' },
];

const seedReports_Alice: DailyReport[] = [
    { id: 'report_alice1', date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), title: "First Day Summary", description: "Completed all onboarding modules and set up my local development machine.", outcomes: "Ready to start on project tasks.", learningObjectives: "Understanding company policies and dev setup.", studentId: 'alice.w@example.com', status: 'APPROVED', lecturerComments: "Great start, keep it up." },
    { id: 'report_alice2', date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), title: "Week 1 UI Component Progress", description: "Focused on building the user profile page. Implemented the avatar and user details sections.", outcomes: "Profile page UI is 50% complete.", learningObjectives: "Advanced Tailwind CSS usage.", studentId: 'alice.w@example.com', status: 'SUBMITTED' },
];

const seedCheckIns_Alice: CheckIn[] = [
    { id: 'checkin_alice1', student_id: 'alice.w@example.com', check_in_timestamp: subDays(new Date(), 3).toISOString(), latitude: 5.6037, longitude: -0.1870, is_gps_verified: true, is_outside_geofence: false, created_at: subDays(new Date(), 3).toISOString(), address_resolved: "Innovatech HQ (GPS)" },
    { id: 'checkin_alice2', student_id: 'alice.w@example.com', check_in_timestamp: subDays(new Date(), 2).toISOString(), latitude: 5.6037, longitude: -0.1870, is_gps_verified: true, is_outside_geofence: false, created_at: subDays(new Date(), 2).toISOString(), address_resolved: "Innovatech HQ (GPS)" },
];

const seedAbuseReports: AbuseReport[] = [
    { id: 'abuse1', title: "Unresponsive Supervisor", description: "My assigned company supervisor has not responded to my last three emails regarding project feedback and I am blocked.", reportedByStudentId: 'bob.b@example.com', reportedByName: 'Bob Builder', dateReported: subDays(new Date(), 2).toISOString(), status: 'OPEN' }
];


export function seedLocalStorage() {
  if (typeof window === "undefined") return;

  // Check if data has already been seeded
  if (localStorage.getItem(SEED_FLAG_KEY)) {
    return;
  }

  console.log("Seeding local storage with initial data...");

  // Seed data
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(seedUsers));
  localStorage.setItem(FACULTY_STORAGE_KEY, JSON.stringify(seedFaculties));
  localStorage.setItem(DEPARTMENT_STORAGE_KEY, JSON.stringify(seedDepartments));
  localStorage.setItem(PLACEMENT_STORAGE_KEY, JSON.stringify(seedPlacements));
  localStorage.setItem(ABUSE_REPORTS_STORAGE_KEY, JSON.stringify(seedAbuseReports));

  // Seed data with prefixes
  localStorage.setItem(`${TASKS_STORAGE_KEY_PREFIX}alice.w@example.com`, JSON.stringify(seedTasks_Alice));
  localStorage.setItem(`${REPORTS_STORAGE_KEY_PREFIX}alice.w@example.com`, JSON.stringify(seedReports_Alice));
  localStorage.setItem(`${CHECKINS_STORAGE_KEY_PREFIX}alice.w@example.com`, JSON.stringify(seedCheckIns_Alice));
  
  // Set flag to indicate seeding is complete
  localStorage.setItem(SEED_FLAG_KEY, 'true');
  console.log("Local storage seeding complete.");
}
