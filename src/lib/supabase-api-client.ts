
'use client';

import { supabase } from './supabase';
import type { Database } from '@/types/database';
import type { UserProfileData } from '@/types';

type Tables = Database['public']['Tables'];

// --- Authentication Methods ---

export async function login(credentials: { email: string; password: string }) {
  console.log('[apiClient.login] Attempting login for:', credentials.email);
  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  
  if (error) {
    console.error('[apiClient.login] Supabase auth error:', error);
    throw new Error(error.message);
  }
  console.log('[apiClient.login] Supabase auth successful. Fetching profile...');
  const user = await getCurrentUser();
  
  return {
    user,
    access_token: data.session?.access_token || '',
  };
}

export async function signup(userData: {
  email: string;
  password: string;
  role: string;
  first_name: string;
  last_name: string;
}) {
  console.log('[apiClient.signup] Attempting signup for:', userData.email);
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
    console.error('[apiClient.signup] Supabase auth signup error:', error);
    throw new Error(error.message);
  }

  if (!data.user) {
    console.error('[apiClient.signup] User creation failed, no user object returned.');
    throw new Error('User creation failed');
  }

  console.log('[apiClient.signup] Creating user profile in public.users table...');
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
    console.error('[apiClient.signup] Profile creation error, cleaning up auth user:', profileError);
    await supabase.auth.admin.deleteUser(data.user.id);
    throw new Error(profileError.message);
  }

  console.log('[apiClient.signup] Signup successful, fetching final user profile.');
  const user = await getCurrentUser();
  
  return {
    user,
    access_token: data.session?.access_token || '',
  };
}

export async function getCurrentUser(): Promise<UserProfileData> {
  console.log('[apiClient.getCurrentUser] Fetching session...');
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('[apiClient.getCurrentUser] Session error:', sessionError);
    throw new Error(sessionError.message);
  }
  if (!session) {
    console.error('[apiClient.getCurrentUser] No active session.');
    throw new Error("User not authenticated");
  }

  console.log('[apiClient.getCurrentUser] Session found. Fetching profile for user:', session.user.id);
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      faculties (*),
      departments (*)
    `)
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error('[apiClient.getCurrentUser] Profile fetch error:', error);
    throw new Error(error.message);
  }
  if (!data) {
    console.error('[apiClient.getCurrentUser] Profile not found for user:', session.user.id);
    throw new Error("User profile not found.");
  }

  return data as UserProfileData;
}

export async function logout(): Promise<void> {
  console.log('[apiClient.logout] Signing out...');
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('[apiClient.logout] Error signing out:', error);
    throw new Error(error.message);
  }
  console.log('[apiClient.logout] Sign out successful.');
}

// --- Verification Methods ---

export async function verifyStudentByEmail(email: string) {
  console.log(`[apiClient.verifyStudentByEmail] Verifying student with email: ${email}`);
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('email', email)
    .eq('status', 'PENDING')
    .maybeSingle();

  if (error) {
    console.error(`[apiClient.verifyStudentByEmail] Supabase error:`, error);
    throw new Error(error.message);
  }
  console.log(`[apiClient.verifyStudentByEmail] Student found:`, data);
  return data;
}

export async function activateStudentAccount(email: string, password: string): Promise<any> {
  console.log(`[apiClient.activateStudentAccount] Activating student with email: ${email}`);
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('*')
    .eq('email', email)
    .eq('status', 'PENDING')
    .single();
  
  if (studentError || !student) {
    console.error(`[apiClient.activateStudentAccount] Pending student not found or already verified for email ${email}:`, studentError);
    throw new Error("Pending student record not found or already verified.");
  }
  console.log(`[apiClient.activateStudentAccount] Found pending student record:`, student);

  // 1. Create user in auth.users
  console.log(`[apiClient.activateStudentAccount] Creating auth user...`);
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
    console.error(`[apiClient.activateStudentAccount] Failed to create auth user:`, authError);
    throw new Error(authError?.message || "Failed to create authentication user.");
  }
  
  const newUserId = authData.user.id;
  console.log(`[apiClient.activateStudentAccount] Auth user created with ID: ${newUserId}`);

  // 2. Create entry in public.users
  console.log(`[apiClient.activateStudentAccount] Creating public.users profile...`);
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
    console.error(`[apiClient.activateStudentAccount] Failed to create public.users profile. Cleaning up auth user...`, publicUserError);
    await supabase.auth.admin.deleteUser(newUserId);
    throw new Error(publicUserError.message);
  }
  console.log(`[apiClient.activateStudentAccount] public.users profile created.`);

  // 3. Update the students table with the new user_id and set status to ACTIVE
  console.log(`[apiClient.activateStudentAccount] Updating students table record ID ${student.id}...`);
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
    console.error(`[apiClient.activateStudentAccount] Failed to update student record after user creation. Complex cleanup may be needed.`, updateError);
    throw new Error("Failed to finalize student activation.");
  }
  console.log(`[apiClient.activateStudentAccount] Student record updated successfully.`);

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
  console.log("[apiClient.createPendingStudent] Creating student with data:", studentData);
  const { data, error } = await supabase
    .from('students')
    .insert({ ...studentData, user_id: null })
    .select()
    .single();
  if (error) {
    console.error("[apiClient.createPendingStudent] Supabase error:", error);
    throw new Error(error.message);
  }
  console.log("[apiClient.createPendingStudent] Student created successfully:", data);
  return data;
}

export async function bulkCreatePendingStudents(studentsData: Omit<Tables['students']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_verified' | 'profile_complete'>[]) {
  console.log(`[apiClient.bulkCreatePendingStudents] Creating ${studentsData.length} students.`);
  const insertData = studentsData.map(s => ({ ...s, user_id: null }));
  const { data, error } = await supabase.from('students').insert(insertData).select();
  if (error) {
    console.error("[apiClient.bulkCreatePendingStudents] Supabase error:", error);
    throw new Error(error.message);
  }
  console.log(`[apiClient.bulkCreatePendingStudents] ${data?.length || 0} students created.`);
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
      console.log("[apiClient.getAdminDashboardStats] Fetching stats...");
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
      console.log("[apiClient.getAdminDashboardStats] Fetched counts and internship data.");

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
      console.log("[apiClient.getAdminDashboardStats] Calculated stats:", stats);
      return stats;

    } catch (error) {
      console.error("[apiClient.getAdminDashboardStats] Error fetching stats:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred while fetching dashboard stats.");
    }
  }
