import type { Database } from './database';

type Tables = Database['public']['Tables'];

// Enhanced types with joined data that matches our API responses
export type StudentWithRelations = Tables['students']['Row'] & {
  users?: Tables['users']['Row'];
  faculties?: Tables['faculties']['Row'];
  departments?: Tables['departments']['Row'];
}

export type InternshipWithRelations = Tables['internships']['Row'] & {
  companies?: Tables['companies']['Row'];
  company_supervisors?: Tables['company_supervisors']['Row'];
  lecturers?: Tables['lecturers']['Row'];
  students?: StudentWithRelations;
}

export type LecturerWithRelations = Tables['lecturers']['Row'] & {
  users?: Tables['users']['Row'];
  faculties?: Tables['faculties']['Row'];
  departments?: Tables['departments']['Row'];
}

export type TaskWithRelations = Tables['daily_tasks']['Row'] & {
  internships?: InternshipWithRelations;
  students?: StudentWithRelations;
}

export type ReportWithRelations = Tables['daily_reports']['Row'] & {
  internships?: InternshipWithRelations;
  students?: StudentWithRelations;
}

// Student summary type for supervisor dashboard
export interface StudentSummary {
  id: number;
  name: string;
  email: string;
  university: string;
  department: string;
  program: string;
  status: string;
  internship: {
    id: number;
    company: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  stats: {
    totalTasks: number;
    pendingTasks: number;
    completedTasks: number;
    totalReports: number;
    pendingReports: number;
    checkInFrequency: number;
  };
}

// Task/Report types for supervisor operations
export type TaskStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type InternshipStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED';
export type StudentStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE';

// Evaluation data structures
export interface EvaluationData {
  internship_id: number;
  evaluator_id: string;
  evaluation_date: string;
  evaluation_type?: 'MID_TERM' | 'FINAL';
  comments?: string;
}

export interface EvaluationScore {
  evaluation_id: number;
  skill_category: string;
  score: number;
  max_score: number;
  comments?: string;
}
