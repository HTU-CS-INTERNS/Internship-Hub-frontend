
'use client';

import type { UserProfileData, CheckIn, Faculty, Department } from '@/types';

// API service for admin-related data, using localStorage as a mock database
export class AdminApiService {
  
  static async getDashboardStats() {
    try {
      const usersRaw = localStorage.getItem('internshipHub_users') || '[]';
      const placementsRaw = localStorage.getItem('hodCompanyApprovalQueue') || '[]';
      const facultiesRaw = localStorage.getItem('internshipHub_faculties') || '[]';
      
      const users: UserProfileData[] = JSON.parse(usersRaw);
      const placements = JSON.parse(placementsRaw);
      const faculties = JSON.parse(facultiesRaw);

      const totalInterns = users.filter(u => u.role === 'STUDENT').length;
      const totalLecturers = users.filter(u => u.role === 'LECTURER').length;
      const activeInternships = placements.filter((p: any) => p.status === 'APPROVED').length;
      const totalCompanies = new Set(placements.map((p: any) => p.companyName)).size;
      const assignedInternIds = new Set(placements.map((p: any) => p.studentId));
      const unassignedInterns = users.filter(u => u.role === 'STUDENT' && u.status === 'ACTIVE' && !assignedInternIds.has(u.email)).length;
      
      return {
        totalFaculties: faculties.length,
        totalInterns,
        activeInternships,
        unassignedInterns,
        totalLecturers,
        avgLecturerWorkload: totalLecturers > 0 ? activeInternships / totalLecturers : 0,
        totalCompanies,
      };
    } catch (error) {
      console.warn('Could not generate admin dashboard stats from localStorage.', error);
      return { totalFaculties: 0, totalInterns: 0, activeInternships: 0, unassignedInterns: 0, totalLecturers: 0, avgLecturerWorkload: 0, totalCompanies: 0 };
    }
  }

  static async getCheckInLogs(): Promise<CheckIn[]> {
    const allCheckins: CheckIn[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('internshipHub_checkins_')) {
            const studentCheckins = JSON.parse(localStorage.getItem(key) || '[]');
            allCheckins.push(...studentCheckins);
        }
    }
    return allCheckins.sort((a,b) => new Date(b.check_in_timestamp).getTime() - new Date(a.check_in_timestamp).getTime());
  }

  static async getAllUsers(filters?: any): Promise<{ users: UserProfileData[], total: number }> {
    const usersRaw = localStorage.getItem('internshipHub_users');
    const allUsers: UserProfileData[] = usersRaw ? JSON.parse(usersRaw) : [];
    return { users: allUsers, total: allUsers.length };
  }

  static async updateUser(userId: string, userData: any): Promise<UserProfileData> {
    const usersRaw = localStorage.getItem('internshipHub_users');
    let allUsers: UserProfileData[] = usersRaw ? JSON.parse(usersRaw) : [];
    const userIndex = allUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");
    allUsers[userIndex] = { ...allUsers[userIndex], ...userData, id: userId };
    localStorage.setItem('internshipHub_users', JSON.stringify(allUsers));
    return allUsers[userIndex];
  }

  static async deleteUser(userId: string): Promise<{ success: boolean }> {
    const usersRaw = localStorage.getItem('internshipHub_users');
    let allUsers: UserProfileData[] = usersRaw ? JSON.parse(usersRaw) : [];
    const filteredUsers = allUsers.filter(u => u.id !== userId);
    if (allUsers.length === filteredUsers.length) throw new Error("User not found");
    localStorage.setItem('internshipHub_users', JSON.stringify(filteredUsers));
    return { success: true };
  }

  static async createUser(userData: any): Promise<UserProfileData> {
    const usersRaw = localStorage.getItem('internshipHub_users');
    let allUsers: UserProfileData[] = usersRaw ? JSON.parse(usersRaw) : [];
    if (allUsers.some(u => u.email === userData.email)) throw new Error("User with this email already exists.");
    const newUser: UserProfileData = { id: `user_${Date.now()}`, status: 'ACTIVE', ...userData };
    allUsers.push(newUser);
    localStorage.setItem('internshipHub_users', JSON.stringify(allUsers));
    return newUser;
  }
  
  static async getPendingStudents(): Promise<UserProfileData[]> {
    const usersRaw = localStorage.getItem('internshipHub_users');
    const facultiesRaw = localStorage.getItem('internshipHub_faculties') || '[]';
    const departmentsRaw = localStorage.getItem('internshipHub_departments') || '[]';
    
    const allUsers: UserProfileData[] = usersRaw ? JSON.parse(usersRaw) : [];
    const faculties: Faculty[] = JSON.parse(facultiesRaw);
    const departments: Department[] = JSON.parse(departmentsRaw);

    const pendingStudents = allUsers
        .filter(u => u.role === 'STUDENT' && u.status === 'PENDING_ACTIVATION')
        .map(student => {
            const faculty = faculties.find(f => f.id === student.faculty_id);
            const department = departments.find(d => d.id === student.department_id);
            return {
                ...student,
                faculty_name: faculty ? faculty.name : 'N/A',
                department_name: department ? department.name : 'N/A',
            };
        });
    
    return pendingStudents;
  }
  
  static async addPendingStudent(studentData: Omit<UserProfileData, 'id' | 'role' | 'status'>): Promise<UserProfileData> {
    const usersRaw = localStorage.getItem('internshipHub_users');
    let allUsers: UserProfileData[] = usersRaw ? JSON.parse(usersRaw) : [];
    if (allUsers.some(u => u.email === studentData.email)) {
      throw new Error("A user with this email already exists.");
    }
    const newUser: UserProfileData = {
      ...studentData,
      id: `user_${Date.now()}`,
      role: 'STUDENT',
      status: 'PENDING_ACTIVATION',
    };
    allUsers.push(newUser);
    localStorage.setItem('internshipHub_users', JSON.stringify(allUsers));
    return newUser;
  }

  static async bulkAddPendingStudents(studentsData: Omit<UserProfileData, 'id' | 'role' | 'status'>[]): Promise<{ success: boolean, added: number }> {
      const usersRaw = localStorage.getItem('internshipHub_users');
      let allUsers: UserProfileData[] = usersRaw ? JSON.parse(usersRaw) : [];
      let addedCount = 0;
      
      studentsData.forEach(studentData => {
          if (!allUsers.some(u => u.email === studentData.email)) {
              const newUser: UserProfileData = {
                  ...studentData,
                  id: `user_${Date.now()}_${addedCount}`,
                  role: 'STUDENT',
                  status: 'PENDING_ACTIVATION',
              };
              allUsers.push(newUser);
              addedCount++;
          }
      });

      localStorage.setItem('internshipHub_users', JSON.stringify(allUsers));
      return { success: true, added: addedCount };
  }

  static async getFaculties() { return JSON.parse(localStorage.getItem('internshipHub_faculties') || '[]'); }
  static async getDepartments(facultyId?: string) { 
      const depts = JSON.parse(localStorage.getItem('internshipHub_departments') || '[]');
      if (facultyId) return depts.filter((d: any) => d.facultyId === facultyId);
      return depts;
  }
  static async createFaculty(facultyData: any) { /* ... */ }
  static async updateFaculty(facultyId: string, facultyData: any) { /* ... */ }
  static async deleteFaculty(facultyId: string) { /* ... */ }
  static async createDepartment(departmentData: any) { /* ... */ }
  static async updateDepartment(departmentId: string, departmentData: any) { /* ... */ }
  static async deleteDepartment(departmentId: string) { /* ... */ }
  static async getStudents(filters?: any) { /* ... */ }
  static async updateStudent(studentId: string, studentData: any) { /* ... */ }
  static async getPendingInternships() { return []; }
  static async approveInternship(submissionId: string, latitude: number, longitude: number, comments?: string) { /* ... */ }
  static async rejectInternship(submissionId: string, reason: string) { /* ... */ }
  static async getCompanies(filters?: any) { return []; }
  static async createCompany(companyData: any) { /* ... */ }
  static async updateCompany(companyId: string, companyData: any) { /* ... */ }
  static async deleteCompany(companyId: string) { /* ... */ }
  static async getSystemStats() { return null; }
  static async getSystemHealth() { return null; }
  static async getSystemLogs(filters?: any) { return []; }
  static async getAnalyticsData(period: 'week' | 'month' | 'quarter' | 'year' = 'month') { return null; }
  static async exportReport(reportType: string, filters?: any) { /* ... */ }
  static async getSystemSettings() { return {}; }
  static async updateSystemSettings(settings: any) { /* ... */ }
  static async getRealtimeStats() { return null; }
  static async getAbuseReports(filters?: any) { return JSON.parse(localStorage.getItem('internshipHub_abuseReports') || '[]'); }
  static async updateAbuseReport(reportId: string, updateData: any) { /* ... */ }
  static async updateAbuseReportStatus(reportId: string, status: string) {
      const reportsRaw = localStorage.getItem('internshipHub_abuseReports') || '[]';
      let reports = JSON.parse(reportsRaw);
      const reportIndex = reports.findIndex((r: any) => r.id === reportId);
      if (reportIndex !== -1) {
          reports[reportIndex].status = status;
          localStorage.setItem('internshipHub_abuseReports', JSON.stringify(reports));
      }
  }
}
