
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

    private async _sendOtp(email: string, role: 'STUDENT' | 'LECTURER' | 'SUPERVISOR'): Promise<{ message: string; otp?: string }> {
        const usersRaw = localStorage.getItem('internshipHub_users');
        if (!usersRaw) throw new Error('Local user database not found.');
        
        const users: UserProfileData[] = JSON.parse(usersRaw);
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);

        if (!user) {
            throw new Error(`No pending ${role.toLowerCase()} found with this email.`);
        }
        if (user.status === 'ACTIVE') {
            throw new Error('This account is already active. Please log in.');
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP temporarily for verification
        localStorage.setItem(`otp_${email}`, otp);
        
        return {
            message: `An OTP has been sent to ${email}.`,
            otp: otp, // For testing purposes
        };
    }

    private async _verifyOtpAndUpdate(data: { email: string; otp_code: string; password: string }, roleToVerify: 'STUDENT' | 'LECTURER' | 'SUPERVISOR', additionalData?: any): Promise<{ message: string; user: any }> {
        const storedOtp = localStorage.getItem(`otp_${data.email}`);
        if (!storedOtp || storedOtp !== data.otp_code) {
            throw new Error('Invalid OTP code.');
        }

        const usersRaw = localStorage.getItem('internshipHub_users');
        if (!usersRaw) throw new Error('Local user database not found.');
        
        let users: UserProfileData[] = JSON.parse(usersRaw);
        const userIndex = users.findIndex(u => u.email.toLowerCase() === data.email.toLowerCase() && u.role === roleToVerify);

        if (userIndex === -1) {
            throw new Error(`User with email ${data.email} not found.`);
        }

        // Update user status and password
        users[userIndex] = {
            ...users[userIndex],
            ...additionalData,
            status: 'ACTIVE',
            password: data.password // In a real app, this should be hashed
        };

        localStorage.setItem('internshipHub_users', JSON.stringify(users));
        localStorage.removeItem(`otp_${data.email}`); // Clean up OTP

        return {
            message: 'Account activated successfully!',
            user: users[userIndex],
        };
    }

    // --- Public Methods ---

    async login(credentials: { email: string; password: string }): Promise<{ user: UserProfileData; access_token: string }> {
        const usersRaw = typeof window !== "undefined" ? localStorage.getItem('internshipHub_users') : null;
        if (!usersRaw) {
            throw new Error("No local user data found. Backend might be required if not seeded.");
        }
        const users: UserProfileData[] = JSON.parse(usersRaw);
        const user = users.find(u => u.email === credentials.email);

        if (!user) {
            throw new Error("Invalid credentials. User not found.");
        }
        if (user.password !== credentials.password) {
            throw new Error("Invalid credentials. Password does not match.");
        }
        if (user.status === 'PENDING_ACTIVATION') {
            throw new Error("Account not activated. Please verify your account first.");
        }
        const mockToken = `local-token-${user.id}-${Date.now()}`;
        if (typeof window !== "undefined") {
            localStorage.setItem('authToken', mockToken);
        }
        return { user, access_token: mockToken };
    }
    
    async signup(userData: any): Promise<{ user: UserProfileData; access_token: string }> {
         // This is now handled by the verification flow, but we keep it for potential future use
         throw new Error("Direct signup is disabled. Please use the verification flow.");
    }
    
    async getCurrentUser(): Promise<UserProfileData> {
        const userRaw = localStorage.getItem('user');
        if (!userRaw) throw new Error("Not authenticated");
        return JSON.parse(userRaw);
    }
    
    async logout(): Promise<void> {
        if (typeof window !== "undefined") {
            localStorage.removeItem('authToken');
        }
    }
    
    // --- Verification Flows ---

    async sendStudentOtp(email: string): Promise<{ message: string; otp?: string }> {
        return this._sendOtp(email, 'STUDENT');
    }

    async verifyStudentOtp(data: { email: string; otp_code: string; password: string }): Promise<{ message: string; user: any }> {
        return this._verifyOtpAndUpdate(data, 'STUDENT');
    }

    async sendSupervisorOtp(email: string): Promise<{ message: string; email: string; otp?: string }> {
        const result = await this._sendOtp(email, 'SUPERVISOR');
        return { ...result, email };
    }

    async verifySupervisorOtp(data: { email: string; otp_code: string; password: string; job_title?: string; phone_number?: string; }): Promise<{ message: string; user: any }> {
        const { email, otp_code, password, ...additionalData } = data;
        return this._verifyOtpAndUpdate({ email, otp_code, password }, 'SUPERVISOR', additionalData);
    }

    async sendLecturerOtp(email: string): Promise<{ message: string; email: string; otp?: string }> {
        const result = await this._sendOtp(email, 'LECTURER');
        return { ...result, email };
    }

    async verifyLecturerOtp(data: { email: string; otp_code: string; password: string; staff_id?: string; phone_number?: string; office_location?: string; }): Promise<{ message: string; user: any }> {
        const { email, otp_code, password, ...additionalData } = data;
        return this._verifyOtpAndUpdate({ email, otp_code, password }, 'LECTURER', additionalData);
    }

    // --- Admin methods ---

    async addPendingStudent(data: any): Promise<any> {
        const usersRaw = localStorage.getItem('internshipHub_users') || '[]';
        const users: UserProfileData[] = JSON.parse(usersRaw);
        if (users.some(u => u.email === data.email || u.id === data.student_id_number)) {
            throw new Error("A student with this email or ID already exists.");
        }
        const newUser: UserProfileData = {
            id: data.student_id_number,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            role: 'STUDENT',
            status: 'PENDING_ACTIVATION',
            faculty_id: data.faculty_id,
            department_id: data.department_id,
            password: `temp_${Date.now()}` // Temporary password
        };
        users.push(newUser);
        localStorage.setItem('internshipHub_users', JSON.stringify(users));
        return newUser;
    }
    
    async getPendingStudents(): Promise<any[]> {
        const usersRaw = localStorage.getItem('internshipHub_users');
        if (!usersRaw) return [];
        const users: UserProfileData[] = JSON.parse(usersRaw);
        return users.filter(u => u.role === 'STUDENT' && u.status === 'PENDING_ACTIVATION');
    }

    // Faculty methods
    async getFaculties(): Promise<any[]> {
         const facultiesRaw = localStorage.getItem('internshipHub_faculties');
         return facultiesRaw ? JSON.parse(facultiesRaw) : [];
    }

    async createFaculty(data: { name: string }): Promise<any> {
       // Mock implementation
    }

    // Department methods
    async getDepartments(facultyId?: number): Promise<any[]> {
        const departmentsRaw = localStorage.getItem('internshipHub_departments');
        const allDepts = departmentsRaw ? JSON.parse(departmentsRaw) : [];
        if(facultyId) {
            return allDepts.filter((d: any) => d.facultyId == facultyId);
        }
        return allDepts;
    }

    async createDepartment(data: { name: string; faculty_id: number }): Promise<any> {
        // Mock implementation
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
        return this.request('api/students/me/profile');
    }

    async updateStudentProfile(data: any): Promise<any> {
        return this.request('api/students/me/profile', {
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
}

// Export singleton instance
export const apiClient = new ApiClient();
