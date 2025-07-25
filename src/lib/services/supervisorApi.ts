import api from '@/lib/api';

// API service for supervisor-related data
export class SupervisorApiService {
  
  // Dashboard Stats
  static async getDashboardStats() {
    try {
      return await api('/supervisor/dashboard/stats');
    } catch (error) {
      console.error('Failed to fetch supervisor dashboard stats:', error);
      return null;
    }
  }

  // Interns Management
  static async getMyInterns(filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await api(`/supervisor/interns${queryString}`);
    } catch (error) {
      console.error('Failed to fetch interns:', error);
      return [];
    }
  }

  static async getInternDetails(internId: string) {
    try {
      return await api(`/supervisor/interns/${internId}`);
    } catch (error) {
      console.error('Failed to fetch intern details:', error);
      return null;
    }
  }

  static async updateInternStatus(internId: string, status: string, notes?: string) {
    try {
      return await api(`/supervisor/interns/${internId}/status`, {
        method: 'PUT',
        body: { status, notes }
      });
    } catch (error) {
      console.error('Failed to update intern status:', error);
      throw error;
    }
  }

  // Task Management
  static async getPendingTasks(filters?: {
    internId?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.internId) params.append('internId', filters.internId);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await api(`/supervisor/tasks/pending${queryString}`);
    } catch (error) {
      console.error('Failed to fetch pending tasks:', error);
      return [];
    }
  }

  static async approveTask(taskId: string, feedback?: string, rating?: number) {
    try {
      return await api(`/supervisor/tasks/${taskId}/approve`, {
        method: 'POST',
        body: { feedback, rating }
      });
    } catch (error) {
      console.error('Failed to approve task:', error);
      throw error;
    }
  }

  static async rejectTask(taskId: string, reason: string) {
    try {
      return await api(`/supervisor/tasks/${taskId}/reject`, {
        method: 'POST',
        body: { reason }
      });
    } catch (error) {
      console.error('Failed to reject task:', error);
      throw error;
    }
  }

  static async assignTask(internId: string, taskData: {
    description: string;
    dueDate: string;
    expected_outcome?: string;
    learning_objective?: string;
  }) {
    try {
      return await api(`/supervisor/interns/${internId}/tasks`, {
        method: 'POST',
        body: {
          description: taskData.description,
          dueDate: taskData.dueDate,
          expected_outcome: taskData.expected_outcome,
          learning_objective: taskData.learning_objective
        }
      });
    } catch (error) {
      console.error('Failed to assign task:', error);
      throw error;
    }
  }

  // Reports Management - Supervisors don't handle reports, lecturers do
  static async getPendingReports(filters?: {
    internId?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    // Supervisors don't handle reports - return empty array
    console.warn('Supervisors do not handle reports. Reports are managed by lecturers.');
    return [];
  }

  static async getReportDetails(reportId: string) {
    // Supervisors don't handle reports - return null
    console.warn('Supervisors do not handle reports. Reports are managed by lecturers.');
    return null;
  }

  static async approveReport(reportId: string, feedback?: string, rating?: number) {
    // Supervisors don't handle reports - throw error
    throw new Error('Supervisors do not handle reports. Reports are managed by lecturers.');
  }

  static async rejectReport(reportId: string, reason: string) {
    // Supervisors don't handle reports - throw error
    throw new Error('Supervisors do not handle reports. Reports are managed by lecturers.');
  }

  // Task Analytics & Performance - New endpoints to match backend
  static async getTaskStats(filters?: {
    period?: string;
    internId?: string;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.period) params.append('period', filters.period);
      if (filters?.internId) params.append('internId', filters.internId);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await api(`/supervisor/tasks/stats${queryString}`);
    } catch (error) {
      console.error('Failed to fetch task stats:', error);
      return null;
    }
  }

  static async getInternTaskAnalytics(internId: string) {
    try {
      return await api(`/supervisor/interns/${internId}/task-analytics`);
    } catch (error) {
      console.error('Failed to fetch intern task analytics:', error);
      return null;
    }
  }

  static async evaluateTask(taskId: string, evaluationData: {
    rating: number;
    feedback: string;
    skillsAssessment?: {
      technical: number;
      communication: number;
      initiative: number;
    };
  }) {
    try {
      return await api(`/supervisor/tasks/${taskId}/evaluate`, {
        method: 'POST',
        body: evaluationData
      });
    } catch (error) {
      console.error('Failed to evaluate task:', error);
      throw error;
    }
  }

  // Analytics & Performance - Updated to match backend endpoints
  static async getInternAnalytics(internId: string, period?: string) {
    try {
      return await this.getInternTaskAnalytics(internId);
    } catch (error) {
      console.error('Failed to fetch intern analytics:', error);
      return null;
    }
  }

  static async getInternActivityLog(internId: string, filters?: {
    type?: string;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await api(`/supervisor/interns/${internId}/activity${queryString}`);
    } catch (error) {
      console.error('Failed to fetch intern activity log:', error);
      return [];
    }
  }

  // Evaluation & Assessment - Using available task evaluation endpoint
  static async submitEvaluation(internId: string, evaluationData: {
    period: string;
    overallRating: number;
    technicalSkills: number;
    communication: number;
    teamwork: number;
    initiative: number;
    punctuality: number;
    comments: string;
    recommendations: string;
  }) {
    // This endpoint is not yet implemented in the backend
    // For now, return a mock response
    console.warn('submitEvaluation endpoint not yet implemented in backend');
    throw new Error('Overall evaluations not yet implemented. Please use task-specific evaluations instead.');
  }

  static async getEvaluations(internId?: string) {
    // This endpoint is not yet implemented in the backend
    console.warn('getEvaluations endpoint not yet implemented in backend');
    return [];
  }

  // Company Profile & Settings
  static async getCompanyProfile() {
    try {
      return await api('/supervisor/company/profile');
    } catch (error) {
      console.error('Failed to fetch company profile:', error);
      return null;
    }
  }

  static async updateCompanyProfile(profileData: any) {
    try {
      return await api('/supervisor/company/profile', {
        method: 'PUT',
        body: profileData
      });
    } catch (error) {
      console.error('Failed to update company profile:', error);
      throw error;
    }
  }

  static async getSupervisorProfile() {
    try {
      return await api('/supervisor/profile');
    } catch (error) {
      console.error('Failed to fetch supervisor profile:', error);
      return null;
    }
  }

  static async updateSupervisorProfile(profileData: any) {
    try {
      return await api('/supervisor/profile', {
        method: 'PUT',
        body: profileData
      });
    } catch (error) {
      console.error('Failed to update supervisor profile:', error);
      throw error;
    }
  }

  // Test connectivity
  static async testConnection() {
    try {
      return await api('/supervisor/dashboard/stats');
    } catch (error) {
      console.error('Connection test failed:', error);
      return null;
    }
  }

  // Notifications & Communication - Note: These endpoints may not be implemented in backend yet
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
      return await api(`/supervisor/notifications${queryString}`);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Return empty array if notifications endpoint is not implemented
      return [];
    }
  }

  static async markNotificationAsRead(notificationId: string) {
    try {
      return await api(`/supervisor/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  static async sendMessageToIntern(internId: string, message: string, subject?: string) {
    try {
      return await api(`/supervisor/interns/${internId}/message`, {
        method: 'POST',
        body: { message, subject }
      });
    } catch (error) {
      console.error('Failed to send message to intern:', error);
      throw error;
    }
  }
}
