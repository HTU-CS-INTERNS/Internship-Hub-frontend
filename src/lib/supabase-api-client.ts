

import { supabase } from './supabase';
import type { Database } from '@/types/database';
import type { UserProfileData } from '@/types';

type Tables = Database['public']['Tables'];

// --- Authentication Methods ---

export async function login(credentials: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  
  if (error) {
    console.error('[apiClient.login] Supabase auth error:', error);
    throw new Error(error.message);
  }
  if (!data.session || !data.user) {
    throw new Error('Authentication failed, no session returned.');
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select(`*, faculties (*), departments (*)`)
    .eq('id', data.user.id)
    .single();
    
  if (profileError || !userProfile) {
    await supabase.auth.signOut();
    throw new Error('User authenticated but profile not found.');
  }
  
  return {
    user: userProfile as UserProfileData,
    access_token: data.session.access_token,
  };
}

export async function signup(userData: {
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

  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .insert({
      id: data.user.id,
      email: userData.email,
      role: userData.role as any,
      first_name: userData.first_name,
      last_name: userData.last_name,
    })
    .select()
    .single();

  if (profileError) {
    await supabase.auth.admin.deleteUser(data.user.id);
    throw new Error(profileError.message);
  }

  return {
    user: userProfile as UserProfileData,
    access_token: data.session?.access_token || '',
  };
}

export async function getCurrentUser(): Promise<UserProfileData> {
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
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

// --- Verification Methods ---

export async function verifyStudentByEmail(email: string) {
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
}

export async function activateStudentAccount(email: string, password: string): Promise<any> {
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('*')
    .eq('email', email)
    .eq('status', 'PENDING')
    .single();
  
  if (studentError || !student) {
    throw new Error("Pending student record not found or already verified.");
  }

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
    await supabase.auth.admin.deleteUser(newUserId);
    throw new Error(publicUserError.message);
  }

  const { data: updatedStudent, error: updateError } = await supabase
    .from('students')
    .update({
      user_id: newUserId,
      status: 'ACTIVE',
      is_verified: true,
      profile_complete: false,
    })
    .eq('id', student.id)
    .select()
    .single();

  if (updateError) {
    throw new Error("Failed to finalize student activation.");
  }

  return updatedStudent;
}


// --- General Data Fetching Methods ---

// User management
export async function getUsers(): Promise<Tables['users']['Row'][]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function updateUser(id: string, userData: Tables['users']['Update']): Promise<Tables['users']['Row']> {
  const { data, error } = await supabase
    .from('users')
    .update(userData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  const { error: authError } = await supabase.auth.admin.deleteUser(id);
  if (authError) throw new Error(authError.message);
}

// Faculty methods
export async function getFaculties(): Promise<Tables['faculties']['Row'][]> {
  const { data, error } = await supabase.from('faculties').select('*').order('name');
  if (error) throw new Error(error.message);
  return data;
}

export async function createFaculty(facultyData: Tables['faculties']['Insert']): Promise<Tables['faculties']['Row']> {
  const { data, error } = await supabase.from('faculties').insert(facultyData).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateFaculty(id: number, facultyData: Tables['faculties']['Update']): Promise<Tables['faculties']['Row']> {
  const { data, error } = await supabase.from('faculties').update(facultyData).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteFaculty(id: number): Promise<void> {
  const { error } = await supabase.from('faculties').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Department methods
export async function getDepartments(facultyId?: number): Promise<Tables['departments']['Row'][]> {
  let query = supabase.from('departments').select('*').order('name');
  if (facultyId) query = query.eq('faculty_id', facultyId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function createDepartment(departmentData: Tables['departments']['Insert']): Promise<Tables['departments']['Row']> {
  const { data, error } = await supabase.from('departments').insert(departmentData).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateDepartment(id: number, departmentData: Tables['departments']['Update']): Promise<Tables['departments']['Row']> {
  const { data, error } = await supabase.from('departments').update(departmentData).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteDepartment(id: number): Promise<void> {
  const { error } = await supabase.from('departments').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Company methods
export async function getCompanies(): Promise<Tables['companies']['Row'][]> {
  const { data, error } = await supabase.from('companies').select('*').order('name');
  if (error) throw new Error(error.message);
  return data;
}

export async function createCompany(companyData: Tables['companies']['Insert']): Promise<Tables['companies']['Row']> {
  const { data, error } = await supabase.from('companies').insert(companyData).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCompany(id: number, companyData: Tables['companies']['Update']): Promise<Tables['companies']['Row']> {
  const { data, error } = await supabase.from('companies').update(companyData).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCompany(id: number): Promise<void> {
  const { error } = await supabase.from('companies').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Student methods
export async function getStudents(): Promise<any[]> {
  const { data, error } = await supabase
    .from('students')
    .select(`*, users:user_id (*), faculties (*), departments (*)`)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createPendingStudent(studentData: Omit<Tables['students']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_verified' | 'profile_complete'>): Promise<Tables['students']['Row']> {
  const { data, error } = await supabase
    .from('students')
    .insert({ ...studentData, user_id: null })
    .select()
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function bulkCreatePendingStudents(studentsData: Omit<Tables['students']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_verified' | 'profile_complete'>[]) {
  const insertData = studentsData.map(s => ({ ...s, user_id: null }));
  const { data, error } = await supabase.from('students').insert(insertData).select();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function updateStudent(id: number, studentData: Tables['students']['Update']): Promise<Tables['students']['Row']> {
  const { data, error } = await supabase.from('students').update(studentData).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

// Other GET methods... (omitted for brevity, they can be refactored similarly if needed)
export async function getInternships(): Promise<any[]> {
  const { data, error } = await supabase.from('internships').select(`*, companies (*), students:student_id (*, users:user_id(*), faculties(*), departments(*)), company_supervisors:company_supervisor_id (*, users:user_id(*)), lecturers:lecturer_id (*)`).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}
export async function updateInternship(id: number, internshipData: Tables['internships']['Update']): Promise<Tables['internships']['Row']> {
    const { data, error } = await supabase.from('internships').update(internshipData).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
}
export async function getDailyReports() { /* ... */ return []; }
export async function getDailyTasks() { /* ... */ return []; }
export async function getLecturers() { /* ... */ return []; }
export async function getCompanySupervisors() { /* ... */ return []; }
export async function getIssues() { /* ... */ return []; }
export async function getEvaluations() { /* ... */ return []; }
export async function createEvaluation(evalData: any) { /* ... */ return {}; }
export async function createEvaluationScore(scoreData: any) { /* ... */ return {}; }

export async function getAdminDashboardStats() {
    try {
      const [
        { count: totalStudents },
        { count: totalLecturers },
        { data: internships, error: internshipsError },
        { count: totalCompanies },
        { count: totalFaculties }
      ] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('lecturers').select('*', { count: 'exact', head: true }),
        supabase.from('internships').select('status, student_id, lecturer_id'),
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('faculties').select('*', { count: 'exact', head: true })
      ]);
      
      if (internshipsError) throw internshipsError;

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

      const stats = {
        totalFaculties: totalFaculties ?? 0,
        totalStudents: totalStudents ?? 0,
        activeInternships,
        unassignedInterns,
        totalLecturers: totalLecturers ?? 0,
        avgLecturerWorkload,
        totalCompanies: totalCompanies ?? 0,
      };
      return stats;

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred while fetching dashboard stats.");
    }
  }

export const apiClient = {
  login,
  signup,
  logout,
  getCurrentUser,
  verifyStudentByEmail,
  activateStudentAccount,
  getUsers,
  updateUser,
  deleteUser,
  getStudents,
  createPendingStudent,
  bulkCreatePendingStudents,
  updateStudent,
  getFaculties,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  getInternships,
  updateInternship,
  getDailyReports,
  getDailyTasks,
  getLecturers,
  getCompanySupervisors,
  getIssues,
  getEvaluations,
  createEvaluation,
  createEvaluationScore,
  getAdminDashboardStats
  // ... add all other methods here
};
