

import { apiClient } from '@/lib/supabase-api-client';
import { BaseService } from './BaseService';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];

/**
 * Student Service - Operations related to the student role
 * Handles internship applications, daily reports, tasks, etc.
 */
export class StudentService extends BaseService {
  
  static async getDashboardData() {
    try {
      const data = await apiClient.getStudentDashboardData();
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async submitInternshipApplication(applicationData: any) {
    try {
      const result = await apiClient.submitInternshipApplication(applicationData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getMyInternshipApplication() {
    try {
      const result = await apiClient.getMyInternshipApplication();
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getMyReports() {
    try {
      const reports = await apiClient.getMyReports();
      return this.handleSuccess(reports || []);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async submitDailyReport(reportData: any) {
    try {
      const result = await apiClient.createDailyReport(reportData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  static async getMyTasks() {
    try {
      const tasks = await apiClient.getMyTasks();
      return this.handleSuccess(tasks || []);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async submitDailyTask(taskData: any) {
    try {
      const result = await apiClient.createDailyTask(taskData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  static async getMyProfile() {
    return this.getCurrentUser();
  }

  static async updateProfile(profileData: Partial<Tables['users']['Update']>) {
    try {
      const user = await this.getCurrentUser();
      if (!user.success || !user.data) {
        throw new Error('User not authenticated');
      }
      const result = await apiClient.updateUser(user.data.id, profileData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  static async getMyCompanyInfo() {
    try {
      const result = await apiClient.getMyCompanyInfo();
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  static async getAttendanceRecords(startDate: string, endDate: string) {
    try {
      const result = await apiClient.getAttendanceRecords(startDate, endDate);
      return this.handleSuccess(result || []);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async checkIn(latitude: number, longitude: number) {
    try {
      const result = await apiClient.checkIn(latitude, longitude);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  static async getDocuments() {
    // This is a placeholder as the documents feature is not fully implemented
    return this.handleSuccess([]);
  }

  static async uploadDocument(formData: FormData) {
    // This is a placeholder for document upload logic
    return this.handleSuccess({ message: "Document uploaded successfully (simulated)" });
  }

  static async getSkills() {
    // Placeholder for fetching skills
    return this.handleSuccess([]);
  }

  static async getMilestones() {
    // Placeholder for fetching milestones
    return this.handleSuccess([]);
  }

  static async getActivityData(period: string) {
    // Placeholder for fetching activity data
    return this.handleSuccess([]);
  }
}
