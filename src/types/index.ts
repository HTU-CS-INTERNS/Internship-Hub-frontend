
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
  startDate: string;
  endDate: string;
  location: string;
  status: InternshipStatus;
  rejectionReason?: string;
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
  lecturerComments?: string; // Added for lecturer feedback
}

export interface DailyReport extends DailyTask {
  title?: string;
  challengesFaced?: string;
  learnings?: string; 
  securePhotoUrl?: string;
  // lecturerComments is inherited from DailyTask
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

export interface ProfileFormValuesExtended extends ProfileFormValues {
    supervisorCompanyName?: string;
    supervisorCompanyAddress?: string;
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
