
'use client';

import { createClient } from '@supabase/supabase-js';
import type { UserProfileData } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

class ApiClient {
  
  // --- Auth Methods ---
  async login(credentials: { email: string; password: string }): Promise<{ user: UserProfileData; access_token: string }> {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword(credentials);

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Invalid login credentials.");
    }
    
    // After successful auth, fetch the user's public profile
    const userProfile = await this.getCurrentUser(authData.user.id);

    if (!userProfile) {
      // This case might happen if the trigger fails or is not set up.
      // It's a critical data inconsistency issue.
      await supabase.auth.signOut();
      throw new Error("Login successful, but user profile not found. Please contact support.");
    }

    return {
      user: userProfile,
      access_token: authData.session?.access_token || '',
    };
  }

  async getCurrentUser(userId?: string): Promise<UserProfileData | null> {
    let currentUserId = userId;
    
    if (!currentUserId) {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) return null;
        currentUserId = authData.user.id;
    }

    if (!currentUserId) return null;

    // Explicitly query the public.users table for the profile
    const { data: profile, error } = await supabase
      .from('users')
      .select(`
        *,
        faculty:faculty_id(name),
        department:department_id(name)
      `)
      .eq('id', currentUserId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error.message);
      // Don't throw here, allow auth context to handle missing profile gracefully
      return null;
    }
    
    if (!profile) return null;

    // Manually map the joined data to match the UserProfileData type
    const userProfile: UserProfileData = {
        ...profile,
        faculty_name: profile.faculty?.name,
        department_name: profile.department?.name,
    };
    
    // Remove the nested faculty/department objects to avoid structure mismatch
    delete (userProfile as any).faculty;
    delete (userProfile as any).department;

    return userProfile;
  }
  
  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  // Generic request handler
  async request<T>(endpoint: string, options: { method?: string; body?: any, headers?: any } = {}): Promise<T> {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
    };
    
    // This is a placeholder for custom backend API calls.
    // In this setup, we'll primarily use the Supabase JS client directly.
    console.warn(`ApiClient.request called for endpoint: ${endpoint}. This is a placeholder and does not make a real API call.`);
    return {} as T;
  }
}

export const apiClient = new ApiClient();
