
'use client';

import type { UserProfileData, DailyTask, DailyReport } from '@/types';
import { apiClient } from '../api-client';

// API service for student-related data
export class StudentApiService {
  
  // Get current user's student profile
  static async getStudentProfile(): Promise<UserProfileData | null> {
    try {
      const userRaw = typeof window !== "undefined" ? localStorage.getItem('user') : null;
      if (!userRaw) {
        console.warn('No user found in localStorage for getStudentProfile.');
        return null;
      }
      return JSON.parse(userRaw) as UserProfileData;
    } catch (error) {
      console.error('Failed to fetch student profile from localStorage:', error);
      return null;
    }
  }

  // Get student's internship details
  static async getInternshipDetails() {
    return this.getMyInternship();
  }

  // Get student's tasks from localStorage
  static async getTasks(internshipId?: number, taskDate?: string): Promise<DailyTask[]> {
     try {
      const studentId = typeof window !== "undefined" ? localStorage.getItem('userEmail') : null;
      if (!studentId) return [];

      const allTasksRaw = localStorage.getItem(`internshipHub_tasks_${studentId}`);
      let allTasks: DailyTask[] = allTasksRaw ? JSON.parse(allTasksRaw) : [];

      if (taskDate) {
        // Ensure date comparison is consistent
        return allTasks.filter((task: DailyTask) => task.date === taskDate);
      }
      return allTasks;
    } catch (error) {
      console.error('Failed to fetch tasks from localStorage:', error);
      return [];
    }
  }

  // Get student's reports from localStorage
  static async getReports(internshipId?: number, reportDate?: string, status?: string): Promise<DailyReport[]> {
     try {
      const studentId = typeof window !== "undefined" ? localStorage.getItem('userEmail') : null;
      if (!studentId) return [];
      const allReportsRaw = localStorage.getItem(`internshipHub_reports_${studentId}`);
      let reports: DailyReport[] = allReportsRaw ? JSON.parse(allReportsRaw) : [];
      if (reportDate) {
        reports = reports.filter(report => report.date === reportDate);
      }
      if (status) {
        reports = reports.filter(report => report.status === status);
      }
      return reports;
    } catch (error) {
      console.error('Failed to fetch reports from localStorage:', error);
      return [];
    }
  }

  // Get company information for student's internship
  static async getCompanyInfo() {
    try {
        const internship = await this.getMyInternship();
        if (!internship) return null;

        const supervisor = {
            name: internship.supervisorName,
            title: 'Senior Engineer',
            email: internship.supervisorEmail,
            phone: '+1 (555) 123-4567',
            avatarUrl: 'https://placehold.co/100x100.png'
        };

        const company = {
            name: internship.companyName,
            address: internship.companyAddress, // Use dynamic address
            logoUrl: `https://placehold.co/150x150.png?text=${internship.companyName?.split(' ')[0] || 'Company'}`,
            description: 'A leading company in its industry, committed to fostering innovation.',
            website: 'https://example.com',
            industry: 'Technology',
            size: '200-500 employees'
        };
        
        return { company, supervisor };
    } catch (error) {
      console.error('Failed to fetch company info from localStorage:', error);
      return null;
    }
  }

  // Get my active internship details (single internship)
  static async getMyInternship() {
    try {
      const studentId = typeof window !== "undefined" ? localStorage.getItem('userEmail') : null;
      if (!studentId) return null;
      const placementsRaw = localStorage.getItem('hodCompanyApprovalQueue');
      if (!placementsRaw) return null;
      const allPlacements = JSON.parse(placementsRaw);
      return allPlacements.find((p: any) => p.studentId === studentId && p.status === 'APPROVED') || null;
    } catch (error) {
      console.error('Failed to fetch internship details from localStorage:', error);
      throw error;
    }
  }

  // Get my internship submission
  static async getMyInternshipSubmission() {
    try {
        const studentId = typeof window !== "undefined" ? localStorage.getItem('userEmail') : null;
        if (!studentId) return null;
        const placementsRaw = localStorage.getItem('hodCompanyApprovalQueue');
        if (!placementsRaw) return null;
        const allPlacements = JSON.parse(placementsRaw);
        return allPlacements.find((p: any) => p.studentId === studentId) || null;
    } catch (error) {
      console.error('Failed to fetch internship submission from localStorage:', error);
      return null;
    }
  }

  // Submit an internship for approval
  static async submitInternshipForApproval(submissionData: any) {
    try {
      const { savePlacement } = await import('@/lib/services/hod.service');
      const studentId = localStorage.getItem('userEmail') || 'unknown';
      const studentName = localStorage.getItem('userName') || 'Unknown';
      await savePlacement({ ...submissionData, status: 'APPROVED' }, studentId, studentName);
      return { success: true, submission: { ...submissionData, status: 'APPROVED' }};
    } catch (error) {
      console.error('Failed to submit internship for approval via localStorage:', error);
      throw error;
    }
  }

  // --- MOCK/PLACEHOLDER METHODS ---
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
    return createReport(reportData);
  }
}
