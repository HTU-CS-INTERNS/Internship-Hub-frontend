
export type UserRole = 'STUDENT' | 'LECTURER' | 'SUPERVISOR' | 'HOD' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  faculty?: Faculty;
  department?: Department;
  companyName?: string;
  companyAddress?: string;
}

export interface Faculty {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
  facultyId: string;
}

export type InternshipStatus = 'NOT_SUBMITTED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface InternshipDetails {
  companyName: string;
  companyAddress?: string;
  supervisorName: string;
  supervisorEmail: string;
  startDate: string; // Store as YYYY-MM-DD string
  endDate: string;   // Store as YYYY-MM-DD string
  location: string;
  status: InternshipStatus;
  rejectionReason?: string;
  hodComments?: string; // For HOD to add comments if needed during approval
  companyLatitude?: number;
  companyLongitude?: number;
  geofenceRadiusMeters?: number;
}

export interface HODApprovalQueueItem {
  studentId: string; // Using email for now as ID
  studentName: string;
  companyName: string;
  supervisorName: string;
  supervisorEmail: string;
  submissionDate: string; // ISO string
  status: 'PENDING_APPROVAL'; // Only pending items are in this queue
}


export interface DailyTask {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  outcomes: string;
  learningObjectives: string;
  studentId: string;
  departmentOutcomeLink?: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  attachments?: string[]; // Array of file names or URLs
  supervisorComments?: string;
  lecturerComments?: string;
}

export interface DailyReport extends DailyTask { // Reports extend tasks for common fields
  title?: string;
  challengesFaced?: string;
  // learnings?: string; // Can use learningObjectives from DailyTask
  securePhotoUrl?: string; // URL or path to the secure photo
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
  photo_url?: string; // URL or path
  supervisor_verification_status?: 'PENDING' | 'VERIFIED' | 'FLAGGED';
  supervisor_comments?: string;
  created_at: string; // ISO string
}
