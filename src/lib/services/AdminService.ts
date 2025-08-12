
import { apiClient } from '@/lib/supabase-api-client';
import { BaseService } from './BaseService';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];
type StudentInsert = Omit<Tables['students']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'>;

/**
 * Admin Service - System administration operations
 * Handles user management, system analytics, and platform oversight
 */
export class AdminService extends BaseService {
  // ==================== USER MANAGEMENT ====================
  
  static async getAllUsers() {
    try {
      const users = await apiClient.getUsers();
      return this.handleSuccess(users || []);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getUserById(id: string) {
    try {
      const users = await apiClient.getUsers();
      const user = users?.find(u => u.id === id);
      return user ? this.handleSuccess(user) : this.handleError('User not found');
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async createUser(userData: {
    email: string;
    password: string;
    role: 'ADMIN' | 'STUDENT' | 'LECTURER' | 'SUPERVISOR';
    first_name: string;
    last_name: string;
  }) {
    try {
      const result = await apiClient.signup(userData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateUser(id: string, userData: Tables['users']['Update']) {
    try {
      const result = await apiClient.updateUser(id, userData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async deleteUser(id: string) {
    try {
      await apiClient.deleteUser(id);
      return this.handleSuccess(null);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async activateUser(id: string) {
    try {
      const result = await apiClient.updateUser(id, { is_active: true });
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async deactivateUser(id: string) {
    try {
      const result = await apiClient.updateUser(id, { is_active: false });
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== STUDENT MANAGEMENT ====================

  static async getAllStudents() {
    try {
      const students = await apiClient.getStudents();
      return this.handleSuccess(students || []);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getStudentById(id: number) {
    try {
      const students = await apiClient.getStudents();
      const student = students?.find(s => s.id === id);
      return student ? this.handleSuccess(student) : this.handleError('Student not found');
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async createStudent(studentData: StudentInsert) {
    try {
      const result = await apiClient.createPendingStudent(studentData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  static async bulkCreateStudents(studentsData: StudentInsert[]) {
    try {
      const result = await apiClient.bulkCreatePendingStudents(studentsData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateStudent(id: number, studentData: Tables['students']['Update']) {
    try {
      const result = await apiClient.updateStudent(id, studentData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  static async getPendingStudents() {
    try {
      const students = await apiClient.getStudents();
      const pendingStudents = students?.filter((s: any) => s.status === 'PENDING') || [];
      return this.handleSuccess(pendingStudents);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getActiveStudents() {
    try {
      const students = await apiClient.getStudents();
      const activeStudents = students?.filter((s: any) => s.status === 'ACTIVE') || [];
      return this.handleSuccess(activeStudents);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async activateStudent(id: number) {
    try {
      const result = await apiClient.updateStudent(id, { 
        status: 'ACTIVE',
        is_verified: true
      });
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async deactivateStudent(id: number) {
    try {
      const result = await apiClient.updateStudent(id, { 
        status: 'INACTIVE',
        is_verified: false
      });
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateStudentStatus(id: number, status: 'PENDING' | 'ACTIVE' | 'INACTIVE') {
    try {
      const updateData: Tables['students']['Update'] = {
        status,
        is_verified: status === 'ACTIVE'
      };
      
      const result = await apiClient.updateStudent(id, updateData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  static async bulkUpdateStudentStatus(ids: number[], status: 'PENDING' | 'ACTIVE' | 'INACTIVE') {
      try {
        const results = await Promise.all(
          ids.map(id => this.updateStudentStatus(id, status))
        );
        
        const failed = results.filter(r => !r.success);
        if (failed.length > 0) {
          throw new Error(`Failed to update ${failed.length} students.`);
        }

        return this.handleSuccess({ updatedCount: results.length });
      } catch(error) {
          return this.handleError(error);
      }
  }


  // ==================== INTERNSHIP MANAGEMENT ====================

  static async getAllInternships(filters?: {
    status?: string;
    company_id?: string;
  }) {
    try {
      const internships = await apiClient.getInternships();
      let filteredInternships = internships || [];

      if (filters?.status) {
        filteredInternships = filteredInternships.filter((i: any) => i.status === filters.status);
      }

      if (filters?.company_id) {
        filteredInternships = filteredInternships.filter((i: any) => 
          i.company_id === parseInt(filters.company_id!)
        );
      }

      return this.handleSuccess(filteredInternships);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getPendingInternships() {
    try {
      const internships = await apiClient.getInternships();
      const pending = internships?.filter((i: any) => i.status === 'PENDING') || [];
      return this.handleSuccess(pending);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getInternshipById(id: number) {
    try {
      const internships = await apiClient.getInternships();
      const internship = internships?.find(i => i.id === id);
      return internship ? this.handleSuccess(internship) : this.handleError('Internship not found');
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateInternshipStatus(internshipId: number, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED', notes?: string) {
    try {
      const updateData: any = {
        status,
        admin_notes: notes
      };

      const result = await apiClient.updateInternship(internshipId, updateData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async approveInternship(internshipId: number, lat?: number, lng?: number, notes?: string) {
    try {
      const updateData: any = {
        status: 'APPROVED' as const,
        admin_notes: notes
      };
      
      const result = await apiClient.updateInternship(internshipId, updateData);
      
      if (lat && lng) {
        const internship = await this.getInternshipById(internshipId);
        if(internship.success && internship.data.company_id){
             await this.updateCompany(internship.data.company_id, { latitude: lat, longitude: lng });
        }
      }

      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async rejectInternship(internshipId: number, reason: string) {
    try {
      const updateData = {
        status: 'REJECTED' as const,
        admin_notes: reason
      };

      const result = await apiClient.updateInternship(internshipId, updateData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  static async bulkApproveInternships(ids: number[]) {
      try {
          const results = await Promise.all(
              ids.map(id => this.approveInternship(id))
          );
          
          const failed = results.filter(r => !r.success);
          if (failed.length > 0) {
            throw new Error(`Failed to approve ${failed.length} internships.`);
          }
          
          return this.handleSuccess({ approvedCount: results.length });
      } catch(error) {
          return this.handleError(error);
      }
  }

  // ==================== COMPANY MANAGEMENT ====================

  static async getCompanies() {
    try {
      const companies = await apiClient.getCompanies();
      return this.handleSuccess(companies || []);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getCompanyById(id: number) {
    try {
      const companies = await apiClient.getCompanies();
      const company = companies?.find(c => c.id === id);
      return company ? this.handleSuccess(company) : this.handleError('Company not found');
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async createCompany(companyData: Tables['companies']['Insert']) {
    try {
      const result = await apiClient.createCompany(companyData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateCompany(id: number, companyData: Tables['companies']['Update']) {
    try {
      const result = await apiClient.updateCompany(id, companyData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async deleteCompany(id: number) {
    try {
      await apiClient.deleteCompany(id);
      return this.handleSuccess(null);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== UNIVERSITY STRUCTURE MANAGEMENT ====================

  static async getFaculties() {
    try {
      const faculties = await apiClient.getFaculties();
      return this.handleSuccess(faculties || []);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async createFaculty(facultyData: Tables['faculties']['Insert']) {
    try {
      const result = await apiClient.createFaculty(facultyData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateFaculty(id: number, facultyData: Tables['faculties']['Update']) {
    try {
      const result = await apiClient.updateFaculty(id, facultyData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async deleteFaculty(id: number) {
    try {
      await apiClient.deleteFaculty(id);
      return this.handleSuccess(null);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  static async getDepartments() {
    try {
      const departments = await apiClient.getDepartments();
      return this.handleSuccess(departments || []);
    } catch (error) {
      return this.handleError(error);
    }
  }


  static async createDepartment(departmentData: Tables['departments']['Insert']) {
    try {
      const result = await apiClient.createDepartment(departmentData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateDepartment(id: number, departmentData: Tables['departments']['Update']) {
    try {
      const result = await apiClient.updateDepartment(id, departmentData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async deleteDepartment(id: number) {
    try {
      await apiClient.deleteDepartment(id);
      return this.handleSuccess(null);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== SYSTEM ANALYTICS & REPORTING ====================

  static async getDashboardStats() {
      try {
          const stats = await apiClient.getAdminDashboardStats();
          return this.handleSuccess(stats);
      } catch (error) {
          return this.handleError(error);
      }
  }

  static async getSystemAnalytics() {
    try {
      const [students, lecturers, supervisors, internships, companies, evaluations] = await Promise.all([
        apiClient.getStudents(),
        apiClient.getLecturers(),
        apiClient.getCompanySupervisors(),
        apiClient.getInternships(),
        apiClient.getCompanies(),
        apiClient.getEvaluations()
      ]);

      const analytics = {
        overview: {
          totalStudents: students?.length || 0,
          totalLecturers: lecturers?.length || 0,
          totalSupervisors: supervisors?.length || 0,
          totalInternships: internships?.length || 0,
          totalCompanies: companies?.length || 0,
          activeInternships: internships?.filter((i: any) => i.status === 'IN_PROGRESS').length || 0
        },
        internshipDistribution: {
          pending: internships?.filter((i: any) => i.status === 'PENDING').length || 0,
          approved: internships?.filter((i: any) => i.status === 'APPROVED').length || 0,
          inProgress: internships?.filter((i: any) => i.status === 'IN_PROGRESS').length || 0,
          completed: internships?.filter((i: any) => i.status === 'COMPLETED').length || 0,
          rejected: internships?.filter((i: any) => i.status === 'REJECTED').length || 0
        },
        userVerificationStatus: {
          studentsAwaitingApproval: students?.filter(s => (s as any).status === 'PENDING').length || 0,
          activeStudents: students?.filter(s => (s as any).status === 'ACTIVE').length || 0,
          inactiveStudents: students?.filter(s => (s as any).status === 'INACTIVE').length || 0,
        },
        evaluationsCount: evaluations?.length || 0,
      };

      return this.handleSuccess(analytics);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Placeholder methods for features not fully implemented in this commit
  static async getSystemHealth() { return this.handleSuccess({ uptime: '99.9%', cpuUsage: 35, memoryUsage: 55 }); }
  static async getSystemLogs() { return this.handleSuccess([]); }
  static async getSystemSettings() { return this.handleSuccess({}); }
  static async updateSystemSettings(settings: any) { return this.handleSuccess(settings); }
  static async getAbuseReports() { return this.handleSuccess([]); }
  static async updateAbuseReportStatus(reportId: string, status: string) { return this.handleSuccess({ id: reportId, status }); }
}

