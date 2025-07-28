
export type UserRole = 'STUDENT' | 'LECTURER' | 'SUPERVISOR' | 'HOD' | 'ADMIN';
export type UserStatus = 'PENDING_ACTIVATION' | 'ACTIVE' | 'INACTIVE';

export interface UserProfileData {
  id: string; // From Supabase Auth, is a UUID
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone_number?: string;
  status: UserStatus;
  
  // Denormalized/joined data for convenience in the frontend
  faculty_id?: string; 
  department_id?: string;
  company_name?: string; 
  
  // For display purposes, not in the `users` table directly
  avatar_url?: string;
  faculty_name?: string;
  department_name?: string;
  password?: string; // Only for local mock data
}

export interface Faculty {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  facultyId: string;
  name: string;
}

export type InternshipStatus = 'NOT_SUBMITTED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface InternshipDetails {
  companyName: string;
  companyAddress?: string;
  supervisorName: string;
  supervisorEmail: string;
  startDate: string; 
  endDate: string;   
  location: string;
  status: InternshipStatus;
  rejectionReason?: string;
  hodComments?: string; 
}


export interface HODApprovalQueueItem {
  studentId: string; 
  studentName: string;
  companyName: string;
  supervisorName: string;
  supervisorEmail: string;
  submissionDate: string; // ISO string
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'; // Extended for logging
  startDate: string;
  endDate: string;
  location: string;
}

export interface AttachmentData {
  name: string;
  type: string;
  size: number;
  dataUri: string; // For mock storage; in real app, this would be a URL
}

export interface DailyTask {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  outcomes: string;
  learningObjectives: string;
  studentId: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  attachments?: AttachmentData[];
  supervisorComments?: string;
  lecturerComments?: string;
}

export interface DailyReport extends DailyTask { 
  title?: string;
  challengesFaced?: string;
  securePhotoUrl?: string;
}


export interface CommunicationMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Assignment {
  studentId: string;
  lecturerId: string;
  companySupervisorId?: string;
}

export interface ScoringMetric {
  id: string;
  label: string;
  description?: string;
}

export interface InternEvaluation {
  scores: Record<string, number | undefined>; // metric_key: score
  overallComments: string;
  evaluationDate?: string; // YYYY-MM-DD
}

export interface ProfileFormValues {
  name: string;
  email: string;
  facultyId?: string;
  departmentId?: string;
  contactNumber?: string;
  supervisorCompanyName?: string;
  supervisorCompanyAddress?: string;
}

export interface CheckIn {
  id: string;
  student_id: string;
  check_in_timestamp: string; // ISO string
  latitude?: number;
  longitude?: number;
  address_resolved?: string;
  manual_reason?: string;
  is_gps_verified: boolean;
  is_outside_geofence: boolean;
  photo_url?: string;
  supervisor_verification_status?: 'PENDING' | 'VERIFIED' | 'FLAGGED';
  supervisor_comments?: string;
  created_at: string; // ISO string
}

export interface AbuseReport {
    id: string;
    title: string;
    description: string;
    reportedByStudentId: string;
    reportedByName: string;
    dateReported: string; // ISO String
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}

export type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  children?: NavItem[];
  section?: string;
  mobile?: boolean;
};
