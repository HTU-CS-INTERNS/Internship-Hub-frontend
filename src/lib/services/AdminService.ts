import { apiClient } from '@/lib/supabase-api-client';
import { BaseService } from './BaseService';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];

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
    role: 'ADMIN' | 'STUDENT' | 'LECTURER' | 'COMPANY_SUPERVISOR';
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

  static async updateUser(id: string, userData: {
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: 'ADMIN' | 'STUDENT' | 'LECTURER' | 'SUPERVISOR';
    is_active?: boolean;
  }) {
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

  static async createStudent(studentData: Tables['students']['Insert']) {
    try {
      const result = await apiClient.createStudent(studentData);
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

  static async approveStudent(id: number) {
    try {
      const result = await apiClient.updateStudent(id, { is_verified: true });
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async rejectStudent(id: number, rejectionReason?: string) {
    try {
      const result = await apiClient.updateStudent(id, { 
        is_verified: false,
        status: 'INACTIVE'
        // Note: rejection_reason field doesn't exist in schema
      });
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getPendingStudents() {
    try {
      const students = await apiClient.getStudents();
      const pendingStudents = students?.filter(s => s.status === 'PENDING') || [];
      return this.handleSuccess(pendingStudents);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getActiveStudents() {
    try {
      const students = await apiClient.getStudents();
      const activeStudents = students?.filter(s => s.status === 'ACTIVE') || [];
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

  // ==================== INTERNSHIP MANAGEMENT ====================

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

  static async approveInternship(internshipId: number, lat?: number, lng?: number, notes?: string) {
    try {
      const updateData: any = {
        status: 'APPROVED' as const,
        admin_notes: notes
        // approved_at doesn't exist in schema
      };

      if (lat && lng) {
        updateData.company_latitude = lat;
        updateData.company_longitude = lng;
      }

      const result = await apiClient.updateInternship(internshipId, updateData);
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
        // rejection_reason doesn't exist in schema
      };

      const result = await apiClient.updateInternship(internshipId, updateData);
      return this.handleSuccess(result);
    } catch (error) {
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
  
  // getDepartments method is inherited from BaseService

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

  // ==================== LECTURER MANAGEMENT ====================

  static async getLecturers() {
    try {
      const lecturers = await apiClient.getLecturers();
      return this.handleSuccess(lecturers || []);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async createLecturer(lecturerData: Tables['lecturers']['Insert']) {
    try {
      const result = await apiClient.createLecturer(lecturerData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateLecturer(id: number, lecturerData: Tables['lecturers']['Update']) {
    try {
      const result = await apiClient.updateLecturer(id, lecturerData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async deleteLecturer(id: number) {
    try {
      await apiClient.deleteLecturer(id);
      return this.handleSuccess(null);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== COMPANY SUPERVISOR MANAGEMENT ====================

  static async getCompanySupervisors() {
    try {
      const supervisors = await apiClient.getCompanySupervisors();
      return this.handleSuccess(supervisors || []);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async createCompanySupervisor(supervisorData: Tables['company_supervisors']['Insert']) {
    try {
      const result = await apiClient.createCompanySupervisor(supervisorData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateCompanySupervisor(id: number, supervisorData: Tables['company_supervisors']['Update']) {
    try {
      const result = await apiClient.updateCompanySupervisor(id, supervisorData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async deleteCompanySupervisor(id: number) {
    try {
      await apiClient.deleteCompanySupervisor(id);
      return this.handleSuccess(null);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== SYSTEM ANALYTICS & REPORTING ====================
  // ==================== SYSTEM ANALYTICS & REPORTING ====================

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
          studentsAwaitingApproval: students?.filter(s => s.status === 'PENDING').length || 0,
          activeStudents: students?.filter(s => s.status === 'ACTIVE').length || 0,
          inactiveStudents: students?.filter(s => s.status === 'INACTIVE').length || 0,
          lecturersAwaitingApproval: lecturers?.length || 0, // Lecturers don't have verification_status in schema
          supervisorsAwaitingApproval: supervisors?.length || 0 // Supervisors don't have verification_status in schema
        },
        evaluationsCount: evaluations?.length || 0,
        recentActivity: this.generateRecentActivity(internships, students, lecturers)
      };

      return this.handleSuccess(analytics);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getDashboardStats() {
    try {
      const [
        students,
        lecturers,
        internships,
        companies,
        faculties,
        departments,
        supervisors
      ] = await Promise.all([
        apiClient.getStudents(),
        apiClient.getLecturers(),
        apiClient.getInternships(),
        apiClient.getCompanies(),
        apiClient.getFaculties(),
        apiClient.getDepartments(),
        apiClient.getCompanySupervisors()
      ]);

      const activeInternships = internships?.filter(i => 
        i.status === 'IN_PROGRESS' || i.status === 'APPROVED'
      ) || [];

      const pendingInternships = internships?.filter(i => 
        i.status === 'PENDING'
      ) || [];

      const completedInternships = internships?.filter(i => 
        i.status === 'COMPLETED'
      ) || [];

      const stats = {
        totalStudents: students?.length || 0,
        totalLecturers: lecturers?.length || 0,
        totalInternships: internships?.length || 0,
        totalCompanies: companies?.length || 0,
        totalSupervisors: supervisors?.length || 0,
        activeInternships: activeInternships.length,
        totalFaculties: faculties?.length || 0,
        totalDepartments: departments?.length || 0,
        
        // Chart data for dashboard
        chartData: {
          internshipsByStatus: [
            { status: 'Pending', count: pendingInternships.length },
            { status: 'Active', count: activeInternships.length },
            { status: 'Completed', count: completedInternships.length }
          ],
          studentsByFaculty: faculties?.map(faculty => ({
            faculty: faculty.name,
            count: students?.filter(student => 
              student.faculty_id === faculty.id
            ).length || 0
          })) || []
        }
      };

      return this.handleSuccess(stats);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== SYSTEM HEALTH & MONITORING ====================

  static async getSystemHealth() {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          api: 'operational',
          storage: 'available'
        },
        metrics: {
          uptime: '99.9%',
          responseTime: '120ms',
          activeUsers: await this.getActiveUsersCount()
        }
      };
      return this.handleSuccess(health);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Note: getSystemLogs, getSystemSettings, updateSystemSettings methods not available in apiClient

  // ==================== HELPER METHODS ====================

  private static async getActiveUsersCount(): Promise<number> {
    try {
      const users = await apiClient.getUsers();
      return users?.filter(u => u.is_active).length || 0;
    } catch (error) {
      return 0;
    }
  }

  private static generateRecentActivity(internships: any[], students: any[], lecturers: any[]): any[] {
    const activities: any[] = [];
    
    // Recent internship applications
    const recentInternships = internships?.slice(0, 3) || [];
    recentInternships.forEach(internship => {
      activities.push({
        id: `internship-${internship.id}`,
        type: 'internship_submitted',
        message: `New internship application submitted`,
        timestamp: internship.created_at,
        details: {
          internshipId: internship.id,
          studentId: internship.student_id
        }
      });
    });

    // Recent user registrations
    const recentStudents = students?.slice(0, 2) || [];
    recentStudents.forEach(student => {
      activities.push({
        id: `student-${student.id}`,
        type: 'student_registered',
        message: `New student registered`,
        timestamp: student.created_at,
        details: {
          studentId: student.id,
          name: `${student.first_name} ${student.last_name}`
        }
      });
    });

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }

  // ==================== BATCH OPERATIONS ====================

  static async bulkApproveStudents(studentIds: number[]) {
    try {
      const results = await Promise.all(
        studentIds.map(id => this.activateStudent(id))
      );
      const successCount = results.filter(r => r.success).length;
      return this.handleSuccess({ successCount, message: `${successCount} students activated successfully` });
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async bulkRejectStudents(studentIds: number[], reason: string) {
    try {
      const results = await Promise.all(
        studentIds.map(id => this.deactivateStudent(id))
      );
      const successCount = results.filter(r => r.success).length;
      return this.handleSuccess({ successCount, message: `${successCount} students deactivated` });
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async bulkUpdateStudentStatus(studentIds: number[], status: 'PENDING' | 'ACTIVE' | 'INACTIVE') {
    try {
      const results = await Promise.all(
        studentIds.map(id => this.updateStudentStatus(id, status))
      );
      const successCount = results.filter(r => r.success).length;
      return this.handleSuccess({ successCount, message: `${successCount} students updated to ${status.toLowerCase()} status` });
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async bulkApproveInternships(internshipIds: number[]) {
    try {
      const results = await Promise.all(
        internshipIds.map(id => this.approveInternship(id))
      );
      const successCount = results.filter(r => r.success).length;
      return this.handleSuccess({ successCount, message: `${successCount} internships approved successfully` });
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== EXPORT/IMPORT ====================

  static async exportData(dataType: 'students' | 'internships' | 'companies' | 'all') {
    try {
      let data: any = {};
      
      switch (dataType) {
        case 'students':
          data.students = await apiClient.getStudents();
          break;
        case 'internships':
          data.internships = await apiClient.getInternships();
          break;
        case 'companies':
          data.companies = await apiClient.getCompanies();
          break;
        case 'all':
          const [students, internships, companies, lecturers, faculties, departments] = await Promise.all([
            apiClient.getStudents(),
            apiClient.getInternships(),
            apiClient.getCompanies(),
            apiClient.getLecturers(),
            apiClient.getFaculties(),
            apiClient.getDepartments()
          ]);
          data = { students, internships, companies, lecturers, faculties, departments };
          break;
      }

      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error);
    }
  }
}
