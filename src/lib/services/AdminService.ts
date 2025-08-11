import { apiClient } from '@/lib/supabase-api-client';
import { BaseService } from './BaseService';

/**
 * Admin Service - System administration operations
 * Handles user management, system analytics, and platform oversight
 */
export class AdminService extends BaseService {

  // System Analytics
  static async getSystemAnalytics() {
    try {
      const [students, lecturers, supervisors, internships, companies, evaluations] = await Promise.all([
        apiClient.getStudents(),
        apiClient.getLecturers(),
        apiClient.getCompanySupervisors(),
        apiClient.getInternships(),
        this.getCompanies(),
        apiClient.getEvaluations()
      ]);

      const analytics = {
        overview: {
          totalStudents: students?.length || 0,
          totalLecturers: lecturers?.length || 0,
          totalSupervisors: supervisors?.length || 0,
          totalInternships: internships?.length || 0,
          totalCompanies: companies.data?.length || 0,
          activeInternships: internships?.filter((i: any) => i.status === 'IN_PROGRESS').length || 0
        },
        internshipDistribution: {
          pending: internships?.filter((i: any) => i.status === 'PENDING').length || 0,
          approved: internships?.filter((i: any) => i.status === 'APPROVED').length || 0,
          inProgress: internships?.filter((i: any) => i.status === 'IN_PROGRESS').length || 0,
          completed: internships?.filter((i: any) => i.status === 'COMPLETED').length || 0
        },
        evaluationsCount: evaluations?.length || 0
      };

      return this.handleSuccess(analytics);
    } catch (error) {
      return this.handleError(error);
    }
  }

  

  // Internship Oversight
  static async getAllInternships(filters?: {
    status?: string;
    company_id?: string;
  }) {
    try {
      let internships = await apiClient.getInternships();

      if (filters?.status) {
        internships = internships?.filter((i: any) => i.status === filters.status) || [];
      }

      if (filters?.company_id) {
        internships = internships?.filter((i: any) => 
          i.company_id === parseInt(filters.company_id!)
        ) || [];
      }

      return this.handleSuccess(internships || []);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateInternshipStatus(internshipId: number, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED', notes?: string) {
    try {
      const updateData = {
        status,
        admin_notes: notes
      };

      const result = await apiClient.updateInternship(internshipId, updateData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Company Management
  static async createCompany(companyData: {
    name: string;
    address: string;
    city: string;
    region: string;
    industry: string;
    contact_email: string;
    contact_phone?: string;
    website?: string;
  }) {
    try {
      const result = await apiClient.createCompany(companyData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Academic Structure Management
  static async createFaculty(facultyData: {
    name: string;
    faculty_code: string;
  }) {
    try {
      const result = await apiClient.createFaculty(facultyData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async createDepartment(departmentData: {
    name: string;
    department_code: string;
    faculty_id: number;
  }) {
    try {
      const result = await apiClient.createDepartment(departmentData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  
  static async getSystemHealth() {
    try {
      // Replace with appropriate apiClient method or implement system health check
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          api: 'operational'
        }
      };
      return this.handleSuccess(health);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getSystemLogs() {
    try {
      // Replace with appropriate apiClient method or implement system logs retrieval
      const logs: any[] = [];
      return this.handleSuccess(logs);
    } catch (error) {
      return this.handleError(error);
    }
  }
  static async approveInternship(internshipId: string, lat: number, lng: number): Promise<any> {
    const response = await fetch(`/api/admin/internships/${internshipId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ latitude: lat, longitude: lng }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to approve internship');
    }
    
    return response.json();
  }

  static async rejectInternship(internshipId: string, reason: string): Promise<any> {
    const response = await fetch(`/api/admin/internships/${internshipId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to reject internship');
    }
    
    return response.json();
  }
}