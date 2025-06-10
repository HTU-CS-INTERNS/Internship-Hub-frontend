
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
  startDate: string; 
  endDate: string;   
  location: string;
  status: InternshipStatus;
  rejectionReason?: string;
  hodComments?: string; 
  companyLatitude?: number;
  companyLongitude?: number;
  geofenceRadiusMeters?: number;
}

export interface HODApprovalQueueItem {
  studentId: string; 
  studentName: string;
  companyName: string;
  supervisorName: string;
  supervisorEmail: string;
  submissionDate: string; // ISO string
  status: 'PENDING_APPROVAL'; 
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
  departmentOutcomeLink?: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  attachments?: AttachmentData[]; // Array of attachment data objects
  supervisorComments?: string;
  lecturerComments?: string;
}

export interface DailyReport extends DailyTask { 
  title?: string;
  challengesFaced?: string;
  securePhotoUrl?: string; // Data URI for mock, URL for real app
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
  photo_url?: string; // Data URI for mock, URL for real app
  supervisor_verification_status?: 'PENDING' | 'VERIFIED' | 'FLAGGED';
  supervisor_comments?: string;
  created_at: string; // ISO string
}
    