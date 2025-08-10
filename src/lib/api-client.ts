
'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { UserProfileData } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

class ApiClient {
  public supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  // --- Auth Methods ---
  async login(credentials: { email: string; password: string }): Promise<{ user: UserProfileData; access_token: string }> {
    const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword(credentials);

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Invalid login credentials.");
    }
    
    // After successful auth, fetch the user's public profile using the new robust method
    const userProfile = await this.getCurrentUser(authData.user.id);

    if (!userProfile) {
      // This case might happen if the trigger fails or is not set up.
      // It's a critical data inconsistency issue.
      await this.supabase.auth.signOut();
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
        const { data: authData } = await this.supabase.auth.getUser();
        if (!authData.user) return null;
        currentUserId = authData.user.id;
    }

    if (!currentUserId) return null;

    // Use an explicit RPC call to a dedicated SQL function for robust data fetching.
    // This avoids schema detection errors with complex joins.
    const { data, error } = await this.supabase
      .rpc('get_user_profile', { user_id_param: currentUserId });

    if (error) {
      console.error('Error fetching user profile via RPC:', error.message);
      // Don't throw here, allow auth context to handle missing profile gracefully
      return null;
    }
    
    // The RPC function returns a single object or null if not found.
    return data || null;
  }
  
  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
  }
}

export const apiClient = new ApiClient();
