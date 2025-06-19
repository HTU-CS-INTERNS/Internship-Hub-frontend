
import { supabase } from '../config/supabaseClient';
import type { UserRole } from '../../../src/types'; // Adjust path if necessary

// Define a type for your user profile data stored in the database
// This should match your 'users' table schema in Supabase
export interface UserProfileData {
  id: string; // Should match Supabase Auth user ID
  name: string;
  email: string;
  role: UserRole;
  faculty_id?: string;
  department_id?: string;
  school_id?: string; // For students
  company_name?: string; // For supervisors
  company_address?: string; // For supervisors
  contact_number?: string;
  avatar_url?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION'; // Ensure this matches your schema
  created_at?: string;
  updated_at?: string;
}

// Create a user profile in your 'users' table
export const createUserProfileInDB = async (profileData: UserProfileData) => {
  const { data, error } = await supabase
    .from('users')
    .insert([profileData])
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile in DB:', error);
  }
  return { data, error };
};

// Get a user profile by their Supabase Auth ID
export const getUserProfileById = async (userId: string): Promise<{ data: UserProfileData | null; error: any }> => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id, name, email, role, faculty_id, department_id, school_id, company_name, company_address, contact_number, avatar_url, status, created_at, updated_at,
      faculties (name),
      departments (name)
    `)
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile by ID:', error);
  }
  return { data: data as UserProfileData | null, error };
};

// Get a user profile by email and confirm role (used during login)
export const findUserByEmailAndRole = async (email: string, expectedRole: UserRole): Promise<UserProfileData | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('role', expectedRole)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: 0 rows found, which is fine
    console.error('Error finding user by email and role:', error);
    return null;
  }
  return data as UserProfileData | null;
};


// Update a user profile
export const updateUserProfileInDB = async (userId: string, updates: Partial<UserProfileData>): Promise<{ data: UserProfileData | null; error: any }> => {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
  }
  return { data: data as UserProfileData | null, error };
};

// Admin: Get all users (with pagination and filtering in a real app)
export const getAllUsers = async (page = 1, limit = 10): Promise<{ data: UserProfileData[] | null; error: any; count: number | null }> => {
  const { data, error, count } = await supabase
    .from('users')
    .select(`
      id, name, email, role, faculty_id, department_id, status,
      faculties (name),
      departments (name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    console.error('Error fetching all users:', error);
  }
  return { data: data as UserProfileData[] | null, error, count };
};

// Admin: Update a user's role or status
export const updateUserRoleAndStatus = async (userId: string, role?: UserRole, status?: UserProfileData['status']): Promise<{ data: UserProfileData | null; error: any }> => {
  const updates: Partial<UserProfileData> = { updated_at: new Date().toISOString() };
  if (role) updates.role = role;
  if (status) updates.status = status;

  if (Object.keys(updates).length === 1) { // only updated_at
    return { data: null, error: { message: 'No role or status provided for update.'}};
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user role/status:', error);
  }
  return { data: data as UserProfileData | null, error };
};
