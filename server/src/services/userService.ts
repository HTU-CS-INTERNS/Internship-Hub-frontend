
import { supabase } from '../config/supabaseClient';
import type { UserRole } from '../../../src/types'; // Adjust path if necessary

// Define a type for your user profile data stored in the database
// This should match your 'users' table schema in Supabase
interface UserProfileData {
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
  created_at?: string;
  updated_at?: string;
}

// Example: Create a user profile in your 'users' table
export const createUserProfile = async (profileData: UserProfileData) => {
  const { data, error } = await supabase
    .from('users') // Replace 'users' with your actual table name
    .insert([profileData])
    .select()
    .single(); // Use .single() if you expect one row back and want it as an object

  if (error) {
    console.error('Error creating user profile in DB:', error);
  }
  return { data, error };
};

// Example: Get a user profile by their Supabase Auth ID
export const getUserProfileById = async (userId: string) => {
  const { data, error } = await supabase
    .from('users') // Replace 'users' with your actual table name
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile by ID:', error);
  }
  return { data, error };
};

// Example: Get a user profile by email and confirm role
export const findUserByEmailWithRole = async (email: string, expectedRole: UserRole): Promise<UserProfileData | null> => {
  const { data, error } = await supabase
    .from('users') // Replace 'users' with your actual table name
    .select('*')
    .eq('email', email)
    .eq('role', expectedRole) // Ensure the user has the role they are trying to log in as
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: 0 rows found, which is fine
    console.error('Error finding user by email and role:', error);
    return null;
  }
  return data as UserProfileData | null;
};


// Example: Update a user profile
export const updateUserProfile = async (userId: string, updates: Partial<UserProfileData>) => {
  const { data, error } = await supabase
    .from('users') // Replace 'users' with your actual table name
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
  }
  return { data, error };
};

// You'll add more functions here to interact with your Supabase tables
// e.g., functions for internship placements, tasks, reports, etc.
