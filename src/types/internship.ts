import { User } from './api';

export interface InternshipDetails {
  id: number;
  student_id: number;
  company_id: number;
  start_date: string;
  end_date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  student: User;
  company: CompanyDetails;
}

export interface PendingInternshipDetails {
  submission_id: string;
  student_name: string;
  student_id_number: string;
  company_name: string;
  submission_date: string;
}

export interface CompanyDetails {
    id: number;
    name: string;
    address: string;
    industry: string;
    // ... other fields
}

declare module './api' {
    export interface InternshipDetails {
        id: number;
        student_id: number;
        company_id: number;
        start_date: string;
        end_date: string;
        status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
        student: User;
        company: CompanyDetails;
    }

    export interface PendingInternshipDetails {
        submission_id: string;
        student_name: string;
        student_id_number: string;
        company_name: string;
        submission_date: string;
    }

    export interface CompanyDetails {
        id: number;
        name: string;
        address: string;
        industry: string;
    }
}
