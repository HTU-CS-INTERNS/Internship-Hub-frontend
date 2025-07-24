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
    title: string;
    description: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
  }) {
    try {
      return await api(`/supervisor/interns/${internId}/tasks`, {
        method: 'POST',
        body: taskData
      });
    } catch (error) {
      console.error('Failed to assign task:', error);
      throw error;
    }
  }

  // Reports Management
  static async getPendingReports(filters?: {
    internId?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.internId) params.append('internId', filters.internId);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await api(`/supervisor/reports/pending${queryString}`);
    } catch (error) {
      console.error('Failed to fetch pending reports:', error);
      return [];
    }
  }

  static async getReportDetails(reportId: string) {
    try {
      return await api(`/supervisor/reports/${reportId}`);
    } catch (error) {
      console.error('Failed to fetch report details:', error);
      return null;
    }
  }

  static async approveReport(reportId: string, feedback?: string, rating?: number) {
    try {
      return await api(`/supervisor/reports/${reportId}/approve`, {
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
      return await api(`/supervisor/reports/${reportId}/reject`, {
        method: 'POST',
        body: { reason }
      });
    } catch (error) {
      console.error('Failed to reject report:', error);
      throw error;
    }
  }

  // Analytics & Performance
  static async getInternAnalytics(internId: string, period?: string) {
    try {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await api(`/supervisor/interns/${internId}/analytics${queryString}`);
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

  // Evaluation & Assessment
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
    try {
      return await api(`/supervisor/interns/${internId}/evaluation`, {
        method: 'POST',
        body: evaluationData
      });
    } catch (error) {
      console.error('Failed to submit evaluation:', error);
      throw error;
    }
  }

  static async getEvaluations(internId?: string) {
    try {
      const url = internId ? `/supervisor/evaluations?internId=${internId}` : '/supervisor/evaluations';
      return await api(url);
    } catch (error) {
      console.error('Failed to fetch evaluations:', error);
      return [];
    }
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

  // Notifications & Communication
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
