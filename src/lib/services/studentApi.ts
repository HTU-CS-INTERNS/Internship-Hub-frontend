import api from '@/lib/api';
import type { UserProfileData } from '@/types';

// API service for student-related data
export class StudentApiService {
  
  // Get current user's student profile
  static async getStudentProfile(): Promise<UserProfileData | null> {
    try {
      return await api<UserProfileData>('/auth/me');
    } catch (error) {
      console.error('Failed to fetch student profile:', error);
      return null;
    }
  }

  // Get student's internship details (using the actual backend endpoint)
  static async getInternshipDetails() {
    try {
      const internships = await api<any[]>('/api/internships/me');
      return internships?.[0] || null; // Return first internship or null
    } catch (error) {
      console.error('Failed to fetch internship details:', error);
      return null;
    }
  }

  // Get student's internship by ID
  static async getInternshipById(internshipId: number) {
    try {
      return await api(`/api/internships/${internshipId}`);
    } catch (error) {
      console.error('Failed to fetch internship by ID:', error);
      return null;
    }
  }

  // Get student's tasks (from daily-tasks endpoint)
  static async getTasks(internshipId?: number, taskDate?: string) {
    try {
      if (!internshipId) {
        // Get internship first
        const internship = await this.getInternshipDetails();
        if (!internship?.id) {
          return [];
        }
        internshipId = internship.id;
      }
      
      const params = taskDate ? `?task_date=${taskDate}` : '';
      return await api(`/api/internships/${internshipId}/daily-tasks${params}`);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      return [];
    }
  }

  // Get student's reports (from daily-reports endpoint)
  static async getReports(internshipId?: number, reportDate?: string, status?: string) {
    try {
      if (!internshipId) {
        // Get internship first
        const internship = await this.getInternshipDetails();
        if (!internship?.id) {
          return [];
        }
        internshipId = internship.id;
      }
      
      const params = new URLSearchParams();
      if (reportDate) params.append('report_date', reportDate);
      if (status) params.append('status', status);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      
      return await api(`/api/internships/${internshipId}/daily-reports${queryString}`);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      return [];
    }
  }

  // Get specific task by ID
  static async getTaskById(internshipId: number, taskId: number) {
    try {
      return await api(`/api/internships/${internshipId}/daily-tasks/${taskId}`);
    } catch (error) {
      console.error('Failed to fetch task by ID:', error);
      return null;
    }
  }

  // Get specific report by ID
  static async getReportById(internshipId: number, reportId: number) {
    try {
      return await api(`/api/internships/${internshipId}/daily-reports/${reportId}`);
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
      return await api(`/students/activity?period=${period}`);
    } catch (error) {
      console.error('Failed to fetch activity data:', error);
      return [];
    }
  }

  // Get student's dashboard metrics
  static async getDashboardMetrics() {
    try {
      return await api('/students/dashboard/metrics');
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      return null;
    }
  }

  // Get company information for student's internship
  static async getCompanyInfo() {
    try {
      return await api('/students/company');
    } catch (error) {
      console.error('Failed to fetch company info:', error);
      return null;
    }
  }

  // Submit check-in
  static async submitCheckIn(latitude: number, longitude: number) {
    try {
      return await api('/students/check-in', {
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
      return await api('/students/check-out', {
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
      return await api('/students/tasks', {
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
      return await api(`/students/tasks/${taskId}`, {
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
      return await api('/students/reports', {
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
      return await api('/students/documents/upload', {
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
      return await api('/students/profile', {
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
      return await api(`/students/reports/${reportId}`, {
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
      return await api(`/students/documents/${documentId}`, {
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
      return await api('/students/attendance', {
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
      return await api(`/students/skills/${skillId}/progress`, {
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
      return await api(`/students/milestones/${milestoneId}/progress`, {
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
      return await api('/api/students/me/active-internship');
    } catch (error) {
      console.error('Failed to fetch internship details:', error);
      throw error;
    }
  }

  // Get my internship submission
  static async getMyInternshipSubmission() {
    try {
      return await api('/api/internships/my-submission');
    } catch (error) {
      console.error('Failed to fetch internship submission:', error);
      return null;
    }
  }

  // Submit an internship for approval
  static async submitInternshipForApproval(submissionData: any) {
    try {
      return await api('/api/internships/submit', {
        method: 'POST',
        body: submissionData,
      });
    } catch (error) {
      console.error('Failed to submit internship for approval:', error);
      throw error;
    }
  }

  // Perform check-in
  static async checkIn(latitude: number, longitude: number) {
    try {
      return await api('/api/students/me/check-in', {
        method: 'POST',
        body: { latitude, longitude },
      });
    } catch (error) {
      console.error('Failed to perform check-in:', error);
      throw error;
    }
  }
}
