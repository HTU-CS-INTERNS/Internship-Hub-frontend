
export type UserRole = 'STUDENT' | 'LECTURER' | 'SUPERVISOR' | 'HOD';

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
}

export interface HODApprovalQueueItem {
  studentId: string; // Using email for now as ID
  studentName: string;
  companyName: string;
  supervisorName: string;
  supervisorEmail: string;
  submissionDate: string; // ISO string
  status: 'PENDING_APPROVAL'; // Only pending items are in this queue
  // Potentially add facultyId and departmentId if HODs are scoped
}


export interface DailyTask {
  id: string;
  date: string;
  description: string;
  outcomes: string;
  learningObjectives: string;
  studentId: string;
  departmentOutcomeLink?: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  attachments?: string[];
  supervisorComments?: string;
  lecturerComments?: string;
}

export interface DailyReport extends DailyTask {
  title?: string;
  challengesFaced?: string;
  learnings?: string;
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
  scores: Record<string, number | undefined>;
  overallComments: string;
  evaluationDate?: string;
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
