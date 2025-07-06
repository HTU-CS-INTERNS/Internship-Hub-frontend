'use client';

import type { UserProfileData } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type ApiOptions = {
    headers?: Record<string, string>;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
};

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private getAuthToken(): string | null {
        if (typeof window === "undefined") return null;
        return localStorage.getItem('authToken');
    }

    private getDefaultHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        const token = this.getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
        const url = `${this.baseUrl}/${endpoint.replace(/^\//, '')}`;
        const config: RequestInit = {
            method: options.method || 'GET',
            headers: {
                ...this.getDefaultHeaders(),
                ...options.headers,
            },
        };

        if (options.body && (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return {} as T;
        } catch (error) {
            console.error(`API Error at ${endpoint}:`, error);
            throw error;
        }
    }

    // Authentication methods
    async login(credentials: { email: string; password: string }): Promise<{ user: UserProfileData; access_token: string }> {
        const response = await this.request<{ user: UserProfileData; access_token: string }>('api/auth/login', {
            method: 'POST',
            body: credentials,
        });
        
        // Store the token
        if (typeof window !== "undefined" && response.access_token) {
            localStorage.setItem('authToken', response.access_token);
        }
        
        return response;
    }

    async signup(userData: {
        email: string;
        password: string;
        role: string;
        first_name: string;
        last_name: string;
    }): Promise<{ user: UserProfileData; access_token: string }> {
        const response = await this.request<{ user: UserProfileData; access_token: string }>('api/auth/signup', {
            method: 'POST',
            body: userData,
        });
        
        // Store the token
        if (typeof window !== "undefined" && response.access_token) {
            localStorage.setItem('authToken', response.access_token);
        }
        
        return response;
    }

    async getCurrentUser(): Promise<UserProfileData> {
        return this.request<UserProfileData>('api/auth/me');
    }

    async logout(): Promise<void> {
        if (typeof window !== "undefined") {
            localStorage.removeItem('authToken');
        }
    }

    // Faculty methods
    async getFaculties(): Promise<any[]> {
        return this.request<any[]>('api/faculties');
    }

    async createFaculty(data: { name: string }): Promise<any> {
        return this.request('api/faculties', {
            method: 'POST',
            body: data,
        });
    }

    // Department methods
    async getDepartments(facultyId?: number): Promise<any[]> {
        const query = facultyId ? `?faculty_id=${facultyId}` : '';
        return this.request<any[]>(`api/departments${query}`);
    }

    async createDepartment(data: { name: string; faculty_id: number }): Promise<any> {
        return this.request('api/departments', {
            method: 'POST',
            body: data,
        });
    }

    // Company methods
    async getCompanies(): Promise<any[]> {
        return this.request<any[]>('api/companies');
    }

    async createCompany(data: any): Promise<any> {
        return this.request('api/companies', {
            method: 'POST',
            body: data,
        });
    }

    // Student methods
    async getStudents(query?: any): Promise<any[]> {
        const searchParams = new URLSearchParams();
        if (query) {
            Object.keys(query).forEach(key => {
                if (query[key] !== undefined) {
                    searchParams.append(key, query[key]);
                }
            });
        }
        const queryString = searchParams.toString();
        return this.request<any[]>(`api/students${queryString ? `?${queryString}` : ''}`);
    }

    async getStudentProfile(): Promise<any> {
        return this.request('api/students/me');
    }

    async updateStudentProfile(data: any): Promise<any> {
        return this.request('api/students/me', {
            method: 'PUT',
            body: data,
        });
    }

    // Internship methods
    async getInternships(): Promise<any[]> {
        return this.request<any[]>('api/internships');
    }

    async createInternship(data: any): Promise<any> {
        return this.request('api/internships', {
            method: 'POST',
            body: data,
        });
    }

    async getInternship(id: number): Promise<any> {
        return this.request(`api/internships/${id}`);
    }

    // Student internship submission methods
    async submitInternshipForApproval(data: {
        company_name: string;
        company_address: string;
        supervisor_name: string;
        supervisor_email: string;
        start_date: string;
        end_date: string;
        location: string;
    }): Promise<any> {
        return this.request('api/internships/submit', {
            method: 'POST',
            body: data,
        });
    }

    async getMyInternshipSubmission(): Promise<any> {
        return this.request('api/internships/my-submission');
    }

    // Admin internship management methods
    async getPendingInternshipSubmissions(): Promise<any[]> {
        return this.request<any[]>('api/internships/pending');
    }

    async reviewInternshipSubmission(submissionId: number, data: {
        status: 'APPROVED' | 'REJECTED' | 'PENDING_APPROVAL';
        rejection_reason?: string;
    }): Promise<any> {
        return this.request(`api/internships/pending/${submissionId}/review`, {
            method: 'PUT',
            body: data,
        });
    }

    // Daily Tasks methods (nested under internships)
    async getDailyTasks(internshipId: number, taskDate?: string): Promise<any[]> {
        const query = taskDate ? `?task_date=${taskDate}` : '';
        return this.request<any[]>(`api/internships/${internshipId}/daily-tasks${query}`);
    }

    async createDailyTask(internshipId: number, data: any): Promise<any> {
        return this.request(`api/internships/${internshipId}/daily-tasks`, {
            method: 'POST',
            body: data,
        });
    }

    async updateDailyTask(internshipId: number, taskId: number, data: any): Promise<any> {
        return this.request(`api/internships/${internshipId}/daily-tasks/${taskId}`, {
            method: 'PUT',
            body: data,
        });
    }

    async getDailyTask(internshipId: number, taskId: number): Promise<any> {
        return this.request(`api/internships/${internshipId}/daily-tasks/${taskId}`);
    }

    // Daily Reports methods (nested under internships)
    async getDailyReports(internshipId: number, reportDate?: string): Promise<any[]> {
        const query = reportDate ? `?report_date=${reportDate}` : '';
        return this.request<any[]>(`api/internships/${internshipId}/daily_reports${query}`);
    }

    async createDailyReport(internshipId: number, data: any): Promise<any> {
        return this.request(`api/internships/${internshipId}/daily_reports`, {
            method: 'POST',
            body: data,
        });
    }

    async updateDailyReport(internshipId: number, reportId: number, data: any): Promise<any> {
        return this.request(`api/internships/${internshipId}/daily_reports/${reportId}`, {
            method: 'PUT',
            body: data,
        });
    }

    // Get current user's internship (for students)
    async getMyInternship(): Promise<any> {
        return this.request('api/students/me/internship');
    }

    // User profile methods
    async getMyProfile(): Promise<any> {
        return this.request('api/students/me/profile');
    }

    async updateMyProfile(data: any): Promise<any> {
        return this.request('api/students/me/profile', {
            method: 'PUT',
            body: data,
        });
    }

    // Student verification methods
    async sendStudentOtp(email: string): Promise<{ message: string; otp?: string }> {
        return this.request('api/student-verification/send-otp', {
            method: 'POST',
            body: { email },
        });
    }

    async verifyStudentOtp(data: { email: string; otp_code: string; password: string }): Promise<{ message: string; user: any }> {
        return this.request('api/student-verification/verify-otp', {
            method: 'POST',
            body: data,
        });
    }

    // Admin methods for pending students
    async addPendingStudent(data: {
        student_id_number: string;
        email: string;
        first_name: string;
        last_name: string;
        faculty_id: number;
        department_id: number;
        program_of_study?: string;
    }): Promise<any> {
        return this.request('api/students/pending', {
            method: 'POST',
            body: data,
        });
    }

    async getPendingStudents(): Promise<any[]> {
        return this.request('api/students/pending');
    }
}

// Export singleton instance
export const apiClient = new ApiClient();
