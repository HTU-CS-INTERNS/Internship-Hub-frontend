
'use client';

import type { UserProfileData, UserRole } from "@/types";

// This file is a mock client that interacts with localStorage
// to simulate a real API, preventing any "Failed to fetch" errors.

class ApiClient {
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem('authToken');
  }

  // --- Auth Methods ---
  async login(credentials: { email: string; password: string }): Promise<{ user: UserProfileData; access_token: string }> {
    const usersRaw = typeof window !== "undefined" ? localStorage.getItem('internshipHub_users') : null;
    if (!usersRaw) {
        throw new Error("No local user data found. Please ensure the app is seeded.");
    }
    const users: UserProfileData[] = JSON.parse(usersRaw);
    const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());

    if (!user) {
        throw new Error("Invalid credentials. User not found.");
    }
    if (user.password !== credentials.password) {
        throw new Error("Invalid credentials. Password does not match.");
    }
    if (user.status === 'PENDING_ACTIVATION') {
        throw new Error("Account not activated. Please use the verification flow.");
    }

    const mockToken = `local-token-${user.id}-${Date.now()}`;
    return { user, access_token: mockToken };
  }

  async getCurrentUser(): Promise<UserProfileData | null> {
    const userRaw = typeof window !== "undefined" ? localStorage.getItem('user') : null;
    return userRaw ? JSON.parse(userRaw) : null;
  }

  async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
    }
  }

  // --- Verification Flows ---
  private async _sendOtp(email: string, role: 'STUDENT' | 'LECTURER' | 'SUPERVISOR'): Promise<{ message: string; otp?: string }> {
    const usersRaw = localStorage.getItem('internshipHub_users');
    if (!usersRaw) throw new Error('Local user database not found.');
    
    const users: UserProfileData[] = JSON.parse(usersRaw);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);

    if (!user) {
      throw new Error(`No pending ${role.toLowerCase()} account found for this email.`);
    }
    if (user.status === 'ACTIVE') {
      throw new Error('This account is already active. Please log in.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(`otp_${email}`, otp);
    
    return {
      message: `An OTP has been 'sent' to ${email}.`,
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

    users[userIndex] = {
        ...users[userIndex],
        ...additionalData,
        status: 'ACTIVE',
        password: data.password
    };

    localStorage.setItem('internshipHub_users', JSON.stringify(users));
    localStorage.removeItem(`otp_${data.email}`);

    return {
        message: 'Account activated successfully!',
        user: users[userIndex],
    };
  }
  
  // These are now the primary methods used by the verification components.
  async sendStudentOtp(email: string) { return this._sendOtp(email, 'STUDENT'); }
  async verifyStudentOtp(data: { email: string; otp_code: string; password: string; }) { return this._verifyOtpAndUpdate(data, 'STUDENT'); }
  async sendSupervisorOtp(email: string) { return this._sendOtp(email, 'SUPERVISOR'); }
  async verifySupervisorOtp(data: { email: string; otp_code: string; password: string; job_title?: string; phone_number?: string; }) { return this._verifyOtpAndUpdate(data, 'SUPERVISOR', { job_title: data.job_title, phone_number: data.phone_number }); }
  async sendLecturerOtp(email: string) { return this._sendOtp(email, 'LECTURER'); }
  async verifyLecturerOtp(data: { email: string; otp_code: string; password: string; staff_id?: string; phone_number?: string; office_location?: string; }) { return this._verifyOtpAndUpdate(data, 'LECTURER', { staff_id: data.staff_id, phone_number: data.phone_number, office_location: data.office_location }); }

  // Generic request handler has been removed to prevent any accidental network calls.
  // Add specific mock handlers here if new API interactions are needed.
  async request<T>(endpoint: string, options: { method?: string; body?: any } = {}): Promise<T> {
    console.warn(`ApiClient.request called for unhandled endpoint: ${endpoint}. Returning empty object.`);
    return {} as T;
  }
}

export const apiClient = new ApiClient();
