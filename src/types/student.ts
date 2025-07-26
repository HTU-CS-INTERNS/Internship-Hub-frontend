import { User, Faculty, Department } from './api';

export interface StudentDetails {
  id: number;
  user_id: number;
  student_id_number: string;
  faculty_id: number;
  department_id: number;
  user: User;
  faculty: Faculty;
  department: Department;
  // Add other student-specific fields here
}

export interface PendingStudentDetails {
    id: number;
    student_id_number: string;
    email: string;
    first_name: string;
    last_name: string;
    faculty_id: number;
    department_id: number;
    // Add other pending student-specific fields here
}

// Add these to the existing api.ts file
declare module './api' {
    export interface StudentDetails {
        id: number;
        user_id: number;
        student_id_number: string;
        faculty_id: number;
        department_id: number;
        user: User;
        faculty: Faculty;
        department: Department;
    }

    export interface PendingStudentDetails {
        id: number;
        student_id_number: string;
        email: string;
        first_name: string;
        last_name: string;
        faculty_id: number;
        department_id: number;
    }
}
