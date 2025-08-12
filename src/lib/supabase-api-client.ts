
'use client';

import { supabase } from './supabase';
import type { Database } from '@/types/database';
import type { UserProfileData } from '@/types';

type Tables = Database['public']['Tables'];

const apiClient = {
  // Authentication methods
  async login(credentials: { email: string; password: string }) {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    
    if (error) {
      throw new Error(error.message);
    }

    // Get user profile data
    const user = await this.getCurrentUser();
    
    return {
      user,
      access_token: data.session?.access_token || '',
    };
  },

  async signup(userData: {
    email: string;
    password: string;
    role: string;
    first_name: string;
    last_name: string;
  }) {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('User creation failed');
    }

    // Create user profile in users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: userData.email,
        role: userData.role as any,
        first_name: userData.first_name,
        last_name: userData.last_name,
      });

    if (profileError) {
      // Attempt to clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(data.user.id);
      throw new Error(profileError.message);
    }

    const user = await this.getCurrentUser();
    
    return {
      user,
      access_token: data.session?.access_token || '',
    };
  },

  async getCurrentUser(): Promise<UserProfileData> {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) throw new Error(sessionError.message);
    if (!session) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        faculties (*),
        departments (*)
      `)
      .eq('id', session.user.id)
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("User profile not found.");

    return data as UserProfileData;
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  async verifyStudentByEmail(email: string) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .eq('status', 'PENDING')
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  },
  
  async activateStudentAccount(email: string, password: string): Promise<any> {
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .eq('status', 'PENDING')
      .single();
    
    if (studentError || !student) {
      throw new Error("Pending student record not found or already verified.");
    }

    // 1. Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: student.first_name,
          last_name: student.last_name,
          role: 'STUDENT',
        },
      },
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Failed to create authentication user.");
    }
    
    const newUserId = authData.user.id;

    // 2. Create entry in public.users
    const { error: publicUserError } = await supabase
      .from('users')
      .insert({
        id: newUserId,
        email: student.email,
        role: 'STUDENT',
        first_name: student.first_name,
        last_name: student.last_name,
        is_active: true,
        student_id_number: student.student_id_number,
        faculty_id: student.faculty_id,
        department_id: student.department_id,
      });

    if (publicUserError) {
      // Cleanup: delete the user from auth.users if public.users creation fails
      await supabase.auth.admin.deleteUser(newUserId);
      throw new Error(publicUserError.message);
    }

    // 3. Update the students table with the new user_id and set status to ACTIVE
    const { data: updatedStudent, error: updateError } = await supabase
      .from('students')
      .update({
        user_id: newUserId,
        status: 'ACTIVE',
        is_verified: true,
        profile_complete: false, // They still need to complete their profile
      })
      .eq('id', student.id)
      .select()
      .single();

    if (updateError) {
      // More complex cleanup might be needed here, but for now, we log the error
      console.error("Failed to update student record after user creation:", updateError);
      throw new Error("Failed to finalize student activation.");
    }

    return updatedStudent;
  },

  // User management
  async getUsers(): Promise<Tables['users']['Row'][]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateUser(id: string, userData: Tables['users']['Update']): Promise<Tables['users']['Row']> {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async deleteUser(id: string): Promise<void> {
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    
    if (authError) {
      throw new Error(authError.message);
    }
  },

  // Faculty methods
  async getFaculties(): Promise<Tables['faculties']['Row'][]> {
    const { data, error } = await supabase
      .from('faculties')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createFaculty(facultyData: Tables['faculties']['Insert']): Promise<Tables['faculties']['Row']> {
    const { data, error } = await supabase
      .from('faculties')
      .insert(facultyData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateFaculty(id: number, facultyData: Tables['faculties']['Update']): Promise<Tables['faculties']['Row']> {
    const { data, error } = await supabase
      .from('faculties')
      .update(facultyData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async deleteFaculty(id: number): Promise<void> {
    const { error } = await supabase
      .from('faculties')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },

  // Department methods
  async getDepartments(facultyId?: number): Promise<Tables['departments']['Row'][]> {
    let query = supabase
      .from('departments')
      .select('*')
      .order('name');

    if (facultyId) {
      query = query.eq('faculty_id', facultyId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createDepartment(departmentData: Tables['departments']['Insert']): Promise<Tables['departments']['Row']> {
    const { data, error } = await supabase
      .from('departments')
      .insert(departmentData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateDepartment(id: number, departmentData: Tables['departments']['Update']): Promise<Tables['departments']['Row']> {
    const { data, error } = await supabase
      .from('departments')
      .update(departmentData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async deleteDepartment(id: number): Promise<void> {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },

  // Company methods
  async getCompanies(): Promise<Tables['companies']['Row'][]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createCompany(companyData: Tables['companies']['Insert']): Promise<Tables['companies']['Row']> {
    const { data, error } = await supabase
      .from('companies')
      .insert(companyData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateCompany(id: number, companyData: Tables['companies']['Update']): Promise<Tables['companies']['Row']> {
    const { data, error } = await supabase
      .from('companies')
      .update(companyData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async deleteCompany(id: number): Promise<void> {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },

  // Student methods
  async getStudents(): Promise<any[]> {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        users:user_id (*),
        faculties (*),
        departments (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },
  
  async createPendingStudent(studentData: Omit<Tables['students']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_verified' | 'profile_complete'>): Promise<Tables['students']['Row']> {
    const { data, error } = await supabase
      .from('students')
      .insert({ ...studentData, user_id: null }) // Explicitly set user_id to null
      .select()
      .single();

    if (error) {
      console.error("Error creating pending student:", error);
      throw new Error(error.message);
    }
    
    return data;
  },

  async bulkCreatePendingStudents(studentsData: Omit<Tables['students']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_verified' | 'profile_complete'>[]) {
    const insertData = studentsData.map(s => ({ ...s, user_id: null }));
    const { data, error } = await supabase
      .from('students')
      .insert(insertData)
      .select();

    if (error) {
      console.error("Error bulk creating pending students:", error);
      throw new Error(error.message);
    }

    return data;
  },


  async updateStudent(id: number, studentData: Tables['students']['Update']): Promise<Tables['students']['Row']> {
    const { data, error } = await supabase
      .from('students')
      .update(studentData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Internship methods
  async getInternships(): Promise<any[]> {
    const { data, error } = await supabase
      .from('internships')
      .select(`
        *,
        companies (*),
        students:student_id (
          *,
          users:user_id (*),
          faculties (*),
          departments (*)
        ),
        company_supervisors:company_supervisor_id (
          *,
          users:user_id (*)
        ),
        lecturers:lecturer_id (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching internships:", error);
      throw new Error(error.message);
    }

    return data;
  },


  async createInternship(internshipData: Tables['internships']['Insert']): Promise<Tables['internships']['Row']> {
    const { data, error } = await supabase
      .from('internships')
      .insert(internshipData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateInternship(id: number, internshipData: Tables['internships']['Update']): Promise<Tables['internships']['Row']> {
    const { data, error } = await supabase
      .from('internships')
      .update(internshipData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Daily Reports methods
  async getDailyReports(internshipId?: number): Promise<Tables['daily_reports']['Row'][]> {
    let query = supabase
      .from('daily_reports')
      .select('*')
      .order('report_date', { ascending: false });

    if (internshipId) {
      query = query.eq('internship_id', internshipId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createDailyReport(reportData: Tables['daily_reports']['Insert']): Promise<Tables['daily_reports']['Row']> {
    const { data, error } = await supabase
      .from('daily_reports')
      .insert(reportData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateDailyReport(id: number, reportData: Tables['daily_reports']['Update']): Promise<Tables['daily_reports']['Row']> {
    const { data, error } = await supabase
      .from('daily_reports')
      .update(reportData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Daily Tasks methods
  async getDailyTasks(internshipId?: number): Promise<Tables['daily_tasks']['Row'][]> {
    let query = supabase
      .from('daily_tasks')
      .select('*')
      .order('task_date', { ascending: false });

    if (internshipId) {
      query = query.eq('internship_id', internshipId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createDailyTask(taskData: Tables['daily_tasks']['Insert']): Promise<Tables['daily_tasks']['Row']> {
    const { data, error } = await supabase
      .from('daily_tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateDailyTask(id: number, taskData: Tables['daily_tasks']['Update']): Promise<Tables['daily_tasks']['Row']> {
    const { data, error } = await supabase
      .from('daily_tasks')
      .update(taskData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Location Check-ins methods
  async createLocationCheckIn(checkInData: Tables['location_check_ins']['Insert']): Promise<Tables['location_check_ins']['Row']> {
    const { data, error } = await supabase
      .from('location_check_ins')
      .insert(checkInData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getLocationCheckIns(internshipId?: number): Promise<Tables['location_check_ins']['Row'][]> {
    let query = supabase
      .from('location_check_ins')
      .select('*')
      .order('check_in_timestamp', { ascending: false });

    if (internshipId) {
      query = query.eq('internship_id', internshipId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Lecturers methods
  async getLecturers(): Promise<Tables['lecturers']['Row'][]> {
    const { data, error } = await supabase
      .from('lecturers')
      .select(`
        *,
        users:user_id (*),
        faculties (*),
        departments (*)
      `)
      .order('id');

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createLecturer(lecturerData: Tables['lecturers']['Insert']): Promise<Tables['lecturers']['Row']> {
    const { data, error } = await supabase
      .from('lecturers')
      .insert(lecturerData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateLecturer(id: number, lecturerData: Tables['lecturers']['Update']): Promise<Tables['lecturers']['Row']> {
    const { data, error } = await supabase
      .from('lecturers')
      .update(lecturerData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async deleteLecturer(id: number): Promise<void> {
    const { error } = await supabase
      .from('lecturers')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },

  // Company Supervisors methods
  async getCompanySupervisors(): Promise<Tables['company_supervisors']['Row'][]> {
    const { data, error } = await supabase
      .from('company_supervisors')
      .select(`
        *,
        companies (*),
        users:user_id (*)
      `)
      .order('id');

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createCompanySupervisor(supervisorData: Tables['company_supervisors']['Insert']): Promise<Tables['company_supervisors']['Row']> {
    const { data, error } = await supabase
      .from('company_supervisors')
      .insert(supervisorData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateCompanySupervisor(id: number, supervisorData: Tables['company_supervisors']['Update']): Promise<Tables['company_supervisors']['Row']> {
    const { data, error } = await supabase
      .from('company_supervisors')
      .update(supervisorData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async deleteCompanySupervisor(id: number): Promise<void> {
    const { error } = await supabase
      .from('company_supervisors')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },

  // Issues methods
  async getIssues(): Promise<Tables['issues']['Row'][]> {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createIssue(issueData: Tables['issues']['Insert']): Promise<Tables['issues']['Row']> {
    const { data, error } = await supabase
      .from('issues')
      .insert(issueData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateIssue(id: number, issueData: Tables['issues']['Update']): Promise<Tables['issues']['Row']> {
    const { data, error } = await supabase
      .from('issues')
      .update(issueData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Evaluations methods
  async getEvaluations(): Promise<Tables['evaluations']['Row'][]> {
    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        evaluation_scores (*),
        internships (*),
        evaluator:evaluator_id (*)
      `)
      .order('evaluation_date', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createEvaluation(evaluationData: Tables['evaluations']['Insert']): Promise<Tables['evaluations']['Row']> {
    const { data, error } = await supabase
      .from('evaluations')
      .insert(evaluationData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createEvaluationScore(scoreData: Tables['evaluation_scores']['Insert']): Promise<Tables['evaluation_scores']['Row']> {
    const { data, error } = await supabase
      .from('evaluation_scores')
      .insert(scoreData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  },
  
  async getAdminDashboardStats() {
    try {
      const [
        { count: totalStudents },
        { count: totalLecturers },
        { data: internships },
        { count: totalCompanies },
        { count: totalFaculties }
      ] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('lecturers').select('*', { count: 'exact', head: true }),
        supabase.from('internships').select('status, student_id, lecturer_id'),
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('faculties').select('*', { count: 'exact', head: true })
      ]);

      const activeInternships = internships?.filter(i => i.status === 'APPROVED' || i.status === 'IN_PROGRESS').length || 0;
      const unassignedInterns = internships?.filter(i => i.status === 'APPROVED' && !i.lecturer_id).length || 0;
      
      const lecturerWorkload: { [key: string]: number } = {};
      internships?.forEach(internship => {
        if (internship.lecturer_id) {
          lecturerWorkload[internship.lecturer_id] = (lecturerWorkload[internship.lecturer_id] || 0) + 1;
        }
      });
      
      const workloadValues = Object.values(lecturerWorkload);
      const avgLecturerWorkload = workloadValues.length > 0
        ? workloadValues.reduce((sum, count) => sum + count, 0) / workloadValues.length
        : 0;

      return {
        totalFaculties: totalFaculties ?? 0,
        totalStudents: totalStudents ?? 0,
        activeInternships,
        unassignedInterns,
        totalLecturers: totalLecturers ?? 0,
        avgLecturerWorkload,
        totalCompanies: totalCompanies ?? 0,
      };

    } catch (error) {
      console.error("Error fetching admin dashboard stats:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred while fetching dashboard stats.");
    }
  }
};

// Export the singleton instance
export { apiClient };
export default apiClient;
