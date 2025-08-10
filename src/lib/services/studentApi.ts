
'use client';

import type { UserProfileData, DailyTask, DailyReport } from '@/types';
import { apiClient } from '../api-client';

// API service for student-related data
export class StudentApiService {
  
  // Get current user's student profile
  static async getStudentProfile(): Promise<UserProfileData | null> {
    try {
      const user = await apiClient.getCurrentUser();
      return user;
    } catch (error) {
      console.error('Failed to fetch student profile:', error);
      return null;
    }
  }

  // Get student's tasks
  static async getTasks(internshipId?: number, taskDate?: string): Promise<DailyTask[]> {
     try {
       const { data, error } = await apiClient.supabase
         .from('daily_tasks')
         .select('*')
         .eq('internship_id', internshipId);
        
       if (error) throw error;
       return data || [];
    } catch (error) {
      console.error('Failed to fetch tasks from Supabase:', error);
      return [];
    }
  }

  // Get student's reports
  static async getReports(internshipId?: number, reportDate?: string, status?: string): Promise<DailyReport[]> {
     try {
       const { data, error } = await apiClient.supabase
        .from('daily_reports')
        .select('*')
        .eq('internship_id', internshipId);
      
       if (error) throw error;
       return data || [];
    } catch (error) {
      console.error('Failed to fetch reports from Supabase:', error);
      return [];
    }
  }

  // Get company information for student's internship
  static async getCompanyInfo() {
    try {
        const internship = await this.getMyInternship();
        if (!internship) return null;

        return { 
            company: internship.companies, 
            supervisor: { 
                name: `${internship.company_supervisors.users.first_name} ${internship.company_supervisors.users.last_name}`,
                title: internship.company_supervisors.job_title,
                email: internship.company_supervisors.users.email,
                phone: internship.company_supervisors.users.phone_number,
                avatarUrl: `https://placehold.co/100x100.png?text=${internship.company_supervisors.users.first_name[0]}${internship.company_supervisors.users.last_name[0]}`
            } 
        };
    } catch (error) {
      console.error('Failed to fetch company info from Supabase:', error);
      return null;
    }
  }

  // Get my active internship details
  static async getMyInternship() {
    try {
      const { data: userData } = await apiClient.supabase.auth.getUser();
      if (!userData.user) return null;
      
      const { data, error } = await apiClient.supabase
        .from('internships')
        .select(`
            *,
            companies (*),
            company_supervisors (
                *,
                users (
                    id,
                    email,
                    first_name,
                    last_name,
                    phone_number,
                    is_active
                )
            ),
            lecturers (
                *,
                users (
                    id,
                    email,
                    first_name,
                    last_name,
                    phone_number,
                    is_active
                )
            )
        `)
        .eq('student_id', userData.user.id)
        .eq('status', 'IN_PROGRESS')
        .single();
      
      if (error && error.code !== 'PGRST116') { // Ignore "single row not found" error
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Failed to fetch internship details from Supabase:', error);
      throw error;
    }
  }

  // Get my internship submission status
  static async getMyInternshipSubmission() {
    try {
      const { data: userData } = await apiClient.supabase.auth.getUser();
      if (!userData.user) return null;

      const { data, error } = await apiClient.supabase
        .from('internships')
        .select('*')
        .eq('student_id', userData.user.id)
        .in('status', ['PENDING', 'REJECTED'])
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch internship submission from Supabase:', error);
      return null;
    }
  }

  // Submit an internship for approval
  static async submitInternshipForApproval(submissionData: any) {
    try {
      const { data, error } = await apiClient.supabase
        .from('internships')
        .insert({
          ...submissionData,
          status: 'PENDING',
        });
      
      if (error) throw error;
      return { success: true, submission: data };
    } catch (error) {
      console.error('Failed to submit internship for approval:', error);
      throw error;
    }
  }
  
  static async checkIn(latitude: number, longitude: number) {
    try {
      const internship = await this.getMyInternship();
      if (!internship) throw new Error('No active internship found for check-in.');

      const { data, error } = await apiClient.supabase
        .from('location_check_ins')
        .insert({
          internship_id: internship.id,
          student_id: internship.student_id, // assuming student_id is on the internship record
          latitude,
          longitude,
          is_within_geofence: true, // This should be calculated on the backend
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to perform check-in:', error);
      throw error;
    }
  }
  
  // --- MOCK/PLACEHOLDER METHODS for features not in DB schema yet ---
  static async getAttendanceRecords(startDate?: string, endDate?: string) { return []; }
  static async getDocuments() { return []; }
  static async getProgressData() { return null; }
  static async getSkills() { return []; }
  static async getMilestones() { return []; }
  static async getActivityData(period: 'week' | 'month' | 'all' = 'month') { return []; }
  static async getDashboardMetrics() { return null; }
  static async updateProfile(profileData: any) { return profileData; }
  static async createReport(reportData: any) {
    const { createReport } = await import('@/lib/services/report.service');
    // return createReport(reportData); // This would still use localStorage
  }
}
