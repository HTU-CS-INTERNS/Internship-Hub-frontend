import api from '@/lib/api';

// API service for admin-related data
export class AdminApiService {
  
  // Dashboard Stats
  static async getDashboardStats() {
    try {
      return await api('/api/admin/dashboard/stats');
    } catch (error) {
      console.error('Failed to fetch admin dashboard stats:', error);
      return null;
    }
  }

  // User Management
  static async getAllUsers(filters?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.role) params.append('role', filters.role);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await api(`/api/admin/users${queryString}`);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  }

  static async updateUser(userId: string, userData: any) {
    try {
      return await api(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: userData
      });
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  static async deleteUser(userId: string) {
    try {
      return await api(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  }

  static async createUser(userData: any) {
    try {
      return await api('/api/admin/users', {
        method: 'POST',
        body: userData
      });
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  // University Structure Management
  static async getFaculties() {
    try {
      return await api('/api/admin/faculties');
    } catch (error) {
      console.error('Failed to fetch faculties:', error);
      return [];
    }
  }

  static async getDepartments(facultyId?: string) {
    try {
      const url = facultyId ? `/api/admin/departments?facultyId=${facultyId}` : '/api/admin/departments';
      return await api(url);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      return [];
    }
  }

  static async createFaculty(facultyData: any) {
    try {
      return await api('/api/admin/faculties', {
        method: 'POST',
        body: facultyData
      });
    } catch (error) {
      console.error('Failed to create faculty:', error);
      throw error;
    }
  }

  static async updateFaculty(facultyId: string, facultyData: any) {
    try {
      return await api(`/api/admin/faculties/${facultyId}`, {
        method: 'PUT',
        body: facultyData
      });
    } catch (error) {
      console.error('Failed to update faculty:', error);
      throw error;
    }
  }

  static async deleteFaculty(facultyId: string) {
    try {
      return await api(`/api/admin/faculties/${facultyId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to delete faculty:', error);
      throw error;
    }
  }

  static async createDepartment(departmentData: any) {
    try {
      return await api('/api/admin/departments', {
        method: 'POST',
        body: departmentData
      });
    } catch (error) {
      console.error('Failed to create department:', error);
      throw error;
    }
  }

  static async updateDepartment(departmentId: string, departmentData: any) {
    try {
      return await api(`/api/admin/departments/${departmentId}`, {
        method: 'PUT',
        body: departmentData
      });
    } catch (error) {
      console.error('Failed to update department:', error);
      throw error;
    }
  }

  static async deleteDepartment(departmentId: string) {
    try {
      return await api(`/api/admin/departments/${departmentId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to delete department:', error);
      throw error;
    }
  }

  // Student Management
  static async getStudents(filters?: {
    facultyId?: string;
    departmentId?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.facultyId) params.append('facultyId', filters.facultyId);
      if (filters?.departmentId) params.append('departmentId', filters.departmentId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await api(`/api/admin/students${queryString}`);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      return [];
    }
  }

  static async updateStudent(studentId: string, studentData: any) {
    try {
      return await api(`/api/admin/students/${studentId}`, {
        method: 'PUT',
        body: studentData
      });
    } catch (error) {
      console.error('Failed to update student:', error);
      throw error;
    }
  }

  static async getPendingStudents() {
    try {
      return await api('/api/admin/students/pending');
    } catch (error) {
      console.error('Failed to fetch pending students:', error);
      return [];
    }
  }

  // Internship Management
  static async getPendingInternships() {
    try {
      return await api('/api/internships/pending');
    } catch (error) {
      console.error('Failed to fetch pending internships:', error);
      return [];
    }
  }

  static async approveInternship(submissionId: string, latitude: number, longitude: number, comments?: string) {
    try {
      return await api(`/api/admin/internships/pending/${submissionId}/review`, {
        method: 'PUT',
        body: { 
          status: 'APPROVED',
          rejection_reason: null,
          latitude, 
          longitude
        }
      });
    } catch (error) {
      console.error('Failed to approve internship:', error);
      throw error;
    }
  }

  static async rejectInternship(submissionId: string, reason: string) {
    try {
      return await api(`/api/admin/internships/pending/${submissionId}/review`, {
        method: 'PUT',
        body: { 
          status: 'REJECTED',
          rejection_reason: reason
        }
      });
    } catch (error) {
      console.error('Failed to reject internship:', error);
      throw error;
    }
  }

  // Company Management
  static async getCompanies(filters?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await api(`/api/admin/companies${queryString}`);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      return [];
    }
  }

  static async createCompany(companyData: any) {
    try {
      return await api('/api/admin/companies', {
        method: 'POST',
        body: companyData
      });
    } catch (error) {
      console.error('Failed to create company:', error);
      throw error;
    }
  }

  static async updateCompany(companyId: string, companyData: any) {
    try {
      return await api(`/api/admin/companies/${companyId}`, {
        method: 'PUT',
        body: companyData
      });
    } catch (error) {
      console.error('Failed to update company:', error);
      throw error;
    }
  }

  static async deleteCompany(companyId: string) {
    try {
      return await api(`/api/admin/companies/${companyId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to delete company:', error);
      throw error;
    }
  }

  // System Oversight - Note: These endpoints may not exist in backend yet
  static async getSystemStats() {
    try {
      return await api('/api/admin/system/stats');
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
      return null;
    }
  }

  static async getSystemHealth() {
    try {
      return await api('/api/admin/system/health');
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      return null;
    }
  }

  static async getSystemLogs(filters?: {
    level?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.level) params.append('level', filters.level);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await api(`/api/admin/system/logs${queryString}`);
    } catch (error) {
      console.error('Failed to fetch system logs:', error);
      return [];
    }
  }

  // Reports and Analytics
  static async getAnalyticsData(period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
    try {
      return await api(`/api/admin/analytics?period=${period}`);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      return null;
    }
  }

  static async exportReport(reportType: string, filters?: any) {
    try {
      return await api('/api/admin/reports/export', {
        method: 'POST',
        body: { reportType, filters }
      });
    } catch (error) {
      console.error('Failed to export report:', error);
      throw error;
    }
  }

  // Settings Management
  static async getSystemSettings() {
    try {
      return await api('/api/admin/settings');
    } catch (error) {
      console.error('Failed to fetch system settings:', error);
      return {};
    }
  }

  static async updateSystemSettings(settings: any) {
    try {
      return await api('/api/admin/settings', {
        method: 'PUT',
        body: settings
      });
    } catch (error) {
      console.error('Failed to update system settings:', error);
      throw error;
    }
  }

  // Real-time Updates
  static async getRealtimeStats() {
    try {
      return await api('/api/admin/realtime/stats');
    } catch (error) {
      console.error('Failed to fetch realtime stats:', error);
      return null;
    }
  }

  // Abuse Reports - Note: These endpoints may not exist in backend yet
  static async getAbuseReports(filters?: {
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await api(`/api/admin/abuse-reports${queryString}`);
    } catch (error) {
      console.error('Failed to fetch abuse reports:', error);
      return [];
    }
  }

  static async updateAbuseReport(reportId: string, updateData: any) {
    try {
      return await api(`/api/admin/abuse-reports/${reportId}`, {
        method: 'PUT',
        body: updateData
      });
    } catch (error) {
      console.error('Failed to update abuse report:', error);
      throw error;
    }
  }

  static async updateAbuseReportStatus(reportId: string, status: string) {
    try {
      return await api(`/api/admin/abuse-reports/${reportId}/status`, {
        method: 'PUT',
        body: { status }
      });
    } catch (error) {
      console.error('Failed to update abuse report status:', error);
      throw error;
    }
  }
}
