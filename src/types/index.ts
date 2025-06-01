
export type UserRole = 'STUDENT' | 'LECTURER' | 'SUPERVISOR' | 'HOD';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  faculty?: Faculty;
  department?: Department;
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
  companyAddress?: string; // Made optional in form, ensure type matches
  supervisorName: string;
  supervisorEmail: string;
  startDate: string; // Store as ISO string 'yyyy-MM-dd'
  endDate: string;   // Store as ISO string 'yyyy-MM-dd'
  location: string;
  status: InternshipStatus;
  rejectionReason?: string; // Optional: for lecturer to provide feedback
}

export interface DailyTask {
  id: string;
  date: string;
  description: string;
  outcomes: string;
  learningObjectives: string;
  studentId: string;
  departmentOutcomeLink?: string; // Link to departmental outcomes
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  attachments?: string[]; // URLs to multimedia attachments
  supervisorComments?: string;
}

export interface DailyReport extends DailyTask {
  // Daily reports might have more fields or be a superset of tasks
  // For now, keeping it similar to DailyTask for simplicity
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
