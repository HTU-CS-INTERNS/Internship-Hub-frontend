import api from '@/lib/api';

// API service for lecturer-related data
export class LecturerApiService {
  
  // Dashboard Stats
  static async getDashboardStats() {
    try {
      return await api('/lecturer/dashboard/stats');
    } catch (error) {
      console.error('Failed to fetch lecturer dashboard stats:', error);
      return null;
    }
  }

  // Student Management
  static async getMyStudents(filters?: {
    status?: string;
    search?: string;
    department?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.department) params.append('department', filters.department);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await api(`/lecturer/students${queryString}`);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      return [];
    }
  }

  static async getStudentDetails(studentId: string) {
    try {
      return await api(`/lecturer/students/${studentId}`);
    } catch (error) {
      console.error('Failed to fetch student details:', error);
      return null;
    }
  }

  static async updateStudentStatus(studentId: string, status: string, notes?: string) {
    try {
      return await api(`/lecturer/students/${studentId}/status`, {
        method: 'PUT',
        body: { status, notes }
      });
    } catch (error) {
      console.error('Failed to update student status:', error);
      throw error;
    }
  }

  // Reports Management
  static async getPendingReports(filters?: {
    studentId?: string;
    type?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.studentId) params.append('studentId', filters.studentId);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await api(`/lecturer/reports/pending${queryString}`);
    } catch (error) {
      console.error('Failed to fetch pending reports:', error);
      return [];
    }
  }

  static async getAllReports(filters?: {
    studentId?: string;
    status?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.studentId) params.append('studentId', filters.studentId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await api(`/lecturer/reports${queryString}`);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      return [];
    }
  }

  static async getReportDetails(reportId: string) {
    try {
      return await api(`/lecturer/reports/${reportId}`);
    } catch (error) {
      console.error('Failed to fetch report details:', error);
      return null;
    }
  }

  static async approveReport(reportId: string, feedback?: string, rating?: number) {
    try {
      return await api(`/lecturer/reports/${reportId}/approve`, {
        method: 'POST',
        body: { feedback, rating }
      });
    } catch (error) {
      console.error('Failed to approve report:', error);
      throw error;
    }
  }

  static async rejectReport(reportId: string, reason: string) {
    try {
      return await api(`/lecturer/reports/${reportId}/reject`, {
        method: 'POST',
        body: { reason }
      });
    } catch (error) {
      console.error('Failed to reject report:', error);
      throw error;
    }
  }

  static async requestReportRevision(reportId: string, feedback: string) {
    try {
      return await api(`/lecturer/reports/${reportId}/revision`, {
        method: 'POST',
        body: { feedback }
      });
    } catch (error) {
      console.error('Failed to request revision:', error);
      throw error;
    }
  }

  // Student Progress Tracking
  static async getStudentProgress(studentId: string) {
    try {
      return await api(`/lecturer/students/${studentId}/progress`);
    } catch (error) {
      console.error('Failed to fetch student progress:', error);
      return null;
    }
  }

  static async getStudentTasks(studentId: string, filters?: {
    status?: string;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await api(`/lecturer/students/${studentId}/tasks${queryString}`);
    } catch (error) {
      console.error('Failed to fetch student tasks:', error);
      return [];
    }
  }

  static async getStudentReports(studentId: string, filters?: {
    status?: string;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await api(`/lecturer/students/${studentId}/reports${queryString}`);
    } catch (error) {
      console.error('Failed to fetch student reports:', error);
      return [];
    }
  }

  // Analytics & Assessment
  static async getStudentAnalytics(studentId: string, period?: string) {
    try {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await api(`/lecturer/students/${studentId}/analytics${queryString}`);
    } catch (error) {
      console.error('Failed to fetch student analytics:', error);
      return null;
    }
  }

  static async getDepartmentAnalytics(period?: string) {
    try {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await api(`/lecturer/analytics/department${queryString}`);
    } catch (error) {
      console.error('Failed to fetch department analytics:', error);
      return null;
    }
  }

  // Assessment & Grading
  static async submitAssessment(studentId: string, assessmentData: {
    type: string;
    criteria: Record<string, number>;
    overallGrade: number;
    feedback: string;
    period: string;
  }) {
    try {
      return await api(`/lecturer/students/${studentId}/assessment`, {
        method: 'POST',
        body: assessmentData
      });
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      throw error;
    }
  }

  static async getAssessments(studentId?: string) {
    try {
      const url = studentId ? `/lecturer/assessments?studentId=${studentId}` : '/lecturer/assessments';
      return await api(url);
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
      return [];
    }
  }

  // Communication
  static async getNotifications(filters?: {
    read?: boolean;
    type?: string;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.read !== undefined) params.append('read', filters.read.toString());
      if (filters?.type) params.append('type', filters.type);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await api(`/lecturer/notifications${queryString}`);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }

  static async markNotificationAsRead(notificationId: string) {
    try {
      return await api(`/lecturer/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  static async sendMessageToStudent(studentId: string, message: string, subject?: string) {
    try {
      return await api(`/lecturer/students/${studentId}/message`, {
        method: 'POST',
        body: { message, subject }
      });
    } catch (error) {
      console.error('Failed to send message to student:', error);
      throw error;
    }
  }

  static async getMessages(filters?: {
    studentId?: string;
    read?: boolean;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.studentId) params.append('studentId', filters.studentId);
      if (filters?.read !== undefined) params.append('read', filters.read.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await api(`/lecturer/messages${queryString}`);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      return [];
    }
  }

  // Internship Management
  static async getInternships(filters?: {
    status?: string;
    company?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.company) params.append('company', filters.company);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await api(`/lecturer/internships${queryString}`);
    } catch (error) {
      console.error('Failed to fetch internships:', error);
      return [];
    }
  }

  static async getInternshipDetails(internshipId: string) {
    try {
      return await api(`/lecturer/internships/${internshipId}`);
    } catch (error) {
      console.error('Failed to fetch internship details:', error);
      return null;
    }
  }

  // Profile Management
  static async getLecturerProfile() {
    try {
      return await api('/lecturer/profile');
    } catch (error) {
      console.error('Failed to fetch lecturer profile:', error);
      return null;
    }
  }

  static async updateLecturerProfile(profileData: any) {
    try {
      return await api('/lecturer/profile', {
        method: 'PUT',
        body: profileData
      });
    } catch (error) {
      console.error('Failed to update lecturer profile:', error);
      throw error;
    }
  }
}
