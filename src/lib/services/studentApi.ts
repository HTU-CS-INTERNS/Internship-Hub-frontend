
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

  // Get student's internship details (using the actual backend endpoint)
  static async getInternshipDetails() {
    try {
      const internships = await apiClient.request<any[]>('/api/internships/me');
      return internships?.[0] || null; // Return first internship or null
    } catch (error) {
      console.error('Failed to fetch internship details:', error);
      return null;
    }
  }

  // Get student's internship by ID
  static async getInternshipById(internshipId: number) {
    try {
      return await apiClient.request(`/api/internships/${internshipId}`);
    } catch (error) {
      console.error('Failed to fetch internship by ID:', error);
      return null;
    }
  }

  // Get student's tasks (from daily-tasks endpoint)
  static async getTasks(internshipId?: number, taskDate?: string): Promise<DailyTask[]> {
    try {
      const studentId = typeof window !== "undefined" ? localStorage.getItem('userEmail') : null;
      if (!studentId) return [];

      const allTasksRaw = localStorage.getItem(`internshipHub_tasks_${studentId}`);
      const allTasks = allTasksRaw ? JSON.parse(allTasksRaw) : [];

      if (taskDate) {
        return allTasks.filter((task: DailyTask) => task.date === taskDate);
      }
      return allTasks;
    } catch (error) {
      console.error('Failed to fetch tasks from localStorage:', error);
      return [];
    }
  }

  // Get student's reports (from daily-reports endpoint)
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

  // Get specific task by ID
  static async getTaskById(internshipId: number, taskId: number) {
    try {
      return await apiClient.request(`/api/internships/${internshipId}/daily-tasks/${taskId}`);
    } catch (error) {
      console.error('Failed to fetch task by ID:', error);
      return null;
    }
  }

  // Get specific report by ID
  static async getReportById(internshipId: number, reportId: number) {
    try {
      return await apiClient.request(`/api/internships/${internshipId}/daily-reports/${reportId}`);
    } catch (error) {
      console.error('Failed to fetch report by ID:', error);
      return null;
    }
  }

  // For now, return empty data for endpoints that don't exist yet
  // These would need to be implemented in the backend
  
  // Get student's attendance records (placeholder - needs backend implementation)
  static async getAttendanceRecords(startDate?: string, endDate?: string) {
    try {
      // This endpoint doesn't exist yet - would need to be implemented
      console.warn('Attendance endpoint not implemented yet');
      return [];
    } catch (error) {
      console.error('Failed to fetch attendance records:', error);
      return [];
    }
  }

  // Get student's documents (placeholder - needs backend implementation)
  static async getDocuments() {
    try {
      // This endpoint doesn't exist yet - would need to be implemented
      console.warn('Documents endpoint not implemented yet');
      return [];
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      return [];
    }
  }

  // Get student's progress data (placeholder - needs backend implementation)
  static async getProgressData() {
    try {
      // This endpoint doesn't exist yet - would need to be implemented
      console.warn('Progress endpoint not implemented yet');
      return null;
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
      return null;
    }
  }

  // Get student's skills (placeholder - needs backend implementation)
  static async getSkills() {
    try {
      // This endpoint doesn't exist yet - would need to be implemented
      console.warn('Skills endpoint not implemented yet');
      return [];
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      return [];
    }
  }

  // Get student's milestones (placeholder - needs backend implementation)
  static async getMilestones() {
    try {
      // This endpoint doesn't exist yet - would need to be implemented
      console.warn('Milestones endpoint not implemented yet');
      return [];
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
      return [];
    }
  }

  // Get student's activity data
  static async getActivityData(period: 'week' | 'month' | 'all' = 'month') {
    try {
      return await apiClient.request(`/students/activity?period=${period}`);
    } catch (error) {
      console.error('Failed to fetch activity data:', error);
      return [];
    }
  }

  // Get student's dashboard metrics
  static async getDashboardMetrics() {
    try {
      return await apiClient.request('/students/dashboard/metrics');
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      return null;
    }
  }

  // Get company information for student's internship
  static async getCompanyInfo() {
    try {
        const internship = await this.getMyInternship();
        if (!internship) return null;

        // Mock supervisor details since they aren't deeply nested in the placement object
        const supervisor = {
            name: internship.supervisorName,
            title: 'Senior Engineer', // Placeholder
            email: internship.supervisorEmail,
            phone: '+1 (555) 123-4567', // Placeholder
            avatarUrl: 'https://placehold.co/100x100.png'
        };

        const company = {
            name: internship.companyName,
            address: '123 Tech Park, Silicon Valley, CA', // Placeholder
            logoUrl: `https://placehold.co/150x150.png?text=${internship.companyName.split(' ')[0]}`,
            description: 'A leading company in its industry, committed to fostering innovation.',
            website: 'https://example.com',
            industry: 'Technology',
            size: '200-500 employees'
        };
        
        return { company, supervisor };
    } catch (error) {
      console.error('Failed to fetch company info:', error);
      return null;
    }
  }

  // Submit check-in
  static async submitCheckIn(latitude: number, longitude: number) {
    try {
      return await apiClient.request('/students/check-in', {
        method: 'POST',
        body: { latitude, longitude, timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Failed to submit check-in:', error);
      throw error;
    }
  }

  // Submit check-out
  static async submitCheckOut(latitude: number, longitude: number) {
    try {
      return await apiClient.request('/students/check-out', {
        method: 'POST',
        body: { latitude, longitude, timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Failed to submit check-out:', error);
      throw error;
    }
  }

  // Create new task
  static async createTask(taskData: any) {
    try {
      return await apiClient.request('/students/tasks', {
        method: 'POST',
        body: taskData
      });
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }

  // Update task
  static async updateTask(taskId: string, taskData: any) {
    try {
      return await apiClient.request(`/students/tasks/${taskId}`, {
        method: 'PUT',
        body: taskData
      });
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  }

  // Create new report
  static async createReport(reportData: any) {
    try {
      return await apiClient.request('/students/reports', {
        method: 'POST',
        body: reportData
      });
    } catch (error) {
      console.error('Failed to create report:', error);
      throw error;
    }
  }

  // Upload document
  static async uploadDocument(formData: FormData) {
    try {
      return await apiClient.request('/students/documents/upload', {
        method: 'POST',
        body: formData,
        headers: {} // Let browser set multipart headers
      });
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw error;
    }
  }

  // Update student profile
  static async updateProfile(profileData: any) {
    try {
      return await apiClient.request('/students/profile', {
        method: 'PUT',
        body: profileData
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  // Update report
  static async updateReport(reportId: string, reportData: any) {
    try {
      return await apiClient.request(`/students/reports/${reportId}`, {
        method: 'PUT',
        body: reportData
      });
    } catch (error) {
      console.error('Failed to update report:', error);
      throw error;
    }
  }

  // Delete document
  static async deleteDocument(documentId: string) {
    try {
      return await apiClient.request(`/students/documents/${documentId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  }

  // Submit attendance (for manual attendance tracking)
  static async submitAttendance(attendanceData: any) {
    try {
      return await apiClient.request('/students/attendance', {
        method: 'POST',
        body: attendanceData
      });
    } catch (error) {
      console.error('Failed to submit attendance:', error);
      throw error;
    }
  }

  // Update skill progress
  static async updateSkillProgress(skillId: string, progressData: any) {
    try {
      return await apiClient.request(`/students/skills/${skillId}/progress`, {
        method: 'PUT',
        body: progressData
      });
    } catch (error) {
      console.error('Failed to update skill progress:', error);
      throw error;
    }
  }

  // Update milestone progress
  static async updateMilestoneProgress(milestoneId: string, progressData: any) {
    try {
      return await apiClient.request(`/students/milestones/${milestoneId}/progress`, {
        method: 'PUT',
        body: progressData
      });
    } catch (error) {
      console.error('Failed to update milestone progress:', error);
      throw error;
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

  // Perform check-in
  static async checkIn(latitude: number, longitude: number) {
    try {
      return await apiClient.request('/api/students/me/check-in', {
        method: 'POST',
        body: { latitude, longitude },
      });
    } catch (error) {
      console.error('Failed to perform check-in:', error);
      throw error;
    }
  }
}
