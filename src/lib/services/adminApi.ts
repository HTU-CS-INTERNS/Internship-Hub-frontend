
'use client';

import type { UserProfileData, CheckIn, Faculty, Department } from '@/types';
import { apiClient } from '@/lib/api-client';

// API service for admin-related data, using Supabase
export class AdminApiService {
  
  static async getDashboardStats() {
    try {
      const { data, error } = await apiClient.supabase.rpc('get_admin_dashboard_stats');
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.warn('Could not fetch admin dashboard stats from Supabase.', error);
      return { total_faculties: 0, total_students: 0, active_internships: 0, unassigned_students: 0, total_lecturers: 0, avg_lecturer_workload: 0, total_companies: 0 };
    }
  }

  static async getCheckInLogs(): Promise<CheckIn[]> {
    try {
        const { data, error } = await apiClient.supabase
            .from('location_check_ins')
            .select('*, students(users(first_name, last_name))')
            .order('check_in_timestamp', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to fetch check-in logs:', error);
        return [];
    }
  }

  static async getAllUsers(filters?: any): Promise<{ users: UserProfileData[], total: number }> {
    try {
        const { data, error, count } = await apiClient.supabase
            .from('users')
            .select('*', { count: 'exact' });
        if (error) throw error;
        return { users: data || [], total: count || 0 };
    } catch (error) {
        console.error('Failed to fetch all users:', error);
        return { users: [], total: 0 };
    }
  }

  static async updateUser(userId: string, userData: any): Promise<UserProfileData> {
    try {
        const { data, error } = await apiClient.supabase
            .from('users')
            .update(userData)
            .eq('id', userId)
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to update user:', error);
        throw error;
    }
  }

  static async deleteUser(userId: string): Promise<{ success: boolean }> {
    try {
        const { error } = await apiClient.supabase.auth.admin.deleteUser(userId);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Failed to delete user:', error);
        throw error;
    }
  }

  static async createUser(userData: any): Promise<UserProfileData> {
    try {
        const { data: authData, error: authError } = await apiClient.supabase.auth.admin.createUser({
            email: userData.email,
            password: userData.password,
            email_confirm: true,
        });
        if (authError || !authData.user) throw authError || new Error("User creation failed in auth.");

        const { data: profileData, error: profileError } = await apiClient.supabase
            .from('users')
            .update({
                first_name: userData.first_name,
                last_name: userData.last_name,
                role: userData.role,
                phone_number: userData.phone_number
            })
            .eq('id', authData.user.id)
            .select()
            .single();

        if (profileError) throw profileError;
        return profileData;
    } catch (error) {
        console.error('Failed to create user:', error);
        throw error;
    }
  }
  
  static async getPendingStudents(): Promise<UserProfileData[]> {
    try {
        const { data, error } = await apiClient.supabase
            .from('users')
            .select('*, faculties(name), departments(name)')
            .eq('role', 'STUDENT')
            .eq('is_active', false);
        if (error) throw error;
        return data || [];
    } catch(error) {
        console.error('Failed to get pending students:', error);
        return [];
    }
  }
  
  static async addPendingStudent(studentData: any): Promise<UserProfileData> {
    try {
      const { data, error } = await apiClient.supabase.rpc('add_pending_student', studentData);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to add pending student:', error);
      throw error;
    }
  }

  static async bulkAddPendingStudents(studentsData: any[]): Promise<{ success: boolean, added: number }> {
    try {
      const { data, error } = await apiClient.supabase.rpc('bulk_add_pending_students', { students: studentsData });
      if (error) throw error;
      return { success: true, added: data };
    } catch (error) {
      console.error('Failed to bulk add students:', error);
      throw error;
    }
  }

  static async getFaculties() { 
      const { data, error } = await apiClient.supabase.from('faculties').select('*');
      if (error) throw error;
      return data || [];
  }
  static async getDepartments(facultyId?: string) { 
      let query = apiClient.supabase.from('departments').select('*');
      if (facultyId) {
        query = query.eq('faculty_id', facultyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
  }
  
  static async getSystemLogs(filters?: any) { return []; }
  static async getAbuseReports(filters?: any) { 
      const { data, error } = await apiClient.supabase.from('issues').select('*');
      if (error) throw error;
      return data || [];
  }
  static async updateAbuseReportStatus(reportId: string, status: string) {
      const { error } = await apiClient.supabase
        .from('issues')
        .update({ status: status })
        .eq('id', reportId);
      if (error) throw error;
  }
  
  // Other methods remain as placeholders if not implemented in the backend
  static async createFaculty(facultyData: any) { /* ... */ }
  static async updateFaculty(facultyId: string, facultyData: any) { /* ... */ }
  static async deleteFaculty(facultyId: string) { /* ... */ }
  static async createDepartment(departmentData: any) { /* ... */ }
  static async updateDepartment(departmentId: string, departmentData: any) { /* ... */ }
  static async getStudents(filters?: any) { /* ... */ }
  static async updateStudent(studentId: string, studentData: any) { /* ... */ }
  static async getPendingInternships() { return []; }
  static async approveInternship(submissionId: string, latitude: number, longitude: number, comments?: string) { /* ... */ }
  static async rejectInternship(submissionId: string, reason: string) { /* ... */ }
  static async getCompanies(filters?: any) { return []; }
  static async createCompany(companyData: any) { /* ... */ }
  static async updateCompany(companyId: string, companyData: any) { /* ... */ }
  static async deleteCompany(companyId: string) { /* ... */ }
  static async getSystemStats() { return null; }
  static async getSystemHealth() { return null; }
  static async getAnalyticsData(period: 'week' | 'month' | 'quarter' | 'year' = 'month') { return null; }
  static async exportReport(reportType: string, filters?: any) { /* ... */ }
  static async getSystemSettings() { return {}; }
  static async updateSystemSettings(settings: any) { /* ... */ }
  static async getRealtimeStats() { return null; }
  static async updateAbuseReport(reportId: string, updateData: any) { /* ... */ }
}
