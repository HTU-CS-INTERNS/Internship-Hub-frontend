
import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';
import { createUserProfileInDB, findUserByEmailAndRole, getUserProfileById } from '../services/userService';
import type { UserProfileData } from '../services/userService';

// Student Registration (Final step after OTP, etc., assuming those happened elsewhere or frontend)
export const registerStudent = async (req: Request, res: Response) => {
  const { email, password, name, facultyId, departmentId, schoolId, contactNumber, avatarUrl } = req.body;

  if (!email || !password || !name || !facultyId || !departmentId || !schoolId) {
    return res.status(400).json({ message: 'Missing required fields for student registration.' });
  }

  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          full_name: name, // Custom metadata in Supabase Auth
          // avatar_url: avatarUrl || null // Can also store avatar here
        }
      }
    });

    if (authError) {
      console.error('Supabase Auth signUp error:', authError);
      return res.status(400).json({ message: authError.message });
    }

    if (!authData.user) {
      return res.status(500).json({ message: 'User not created in Supabase Auth.' });
    }
    const userId = authData.user.id;

    // 2. Create user profile in your custom 'users' table
    const profileData: UserProfileData = {
      id: userId,
      email,
      name,
      role: 'STUDENT',
      faculty_id: facultyId,
      department_id: departmentId,
      school_id: schoolId,
      contact_number: contactNumber || undefined,
      avatar_url: avatarUrl || undefined,
      status: 'PENDING_VERIFICATION', // Or 'ACTIVE' if registration implies verification
    };
    
    const { data: profile, error: profileError } = await createUserProfileInDB(profileData);
    
    if (profileError) {
      console.error('Error creating user profile in DB:', profileError);
      // Consider deleting the Supabase Auth user if profile creation fails (requires admin privileges)
      // await supabase.auth.admin.deleteUser(userId); // This needs service_role key
      return res.status(500).json({ message: 'Failed to create user profile. Please contact support.' });
    }

    // For now, returning basic info. Client should not rely on session from signUp directly for app access.
    // Client should typically go to a "verify email" step or login after registration.
    return res.status(201).json({
      message: 'Student registered successfully! Please check your email to verify your account.',
      user: { id: userId, email: authData.user.email, name: profile?.name, role: profile?.role },
      // session: authData.session // Optional: Supabase signUp can also return a session
    });

  } catch (error: any) {
    console.error('Error in registerStudent controller:', error);
    return res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

// User Login
export const loginUser = async (req: Request, res: Response) => {
  const { email, password, role: requestedRole } = req.body; // Role might be used if users can have multiple roles and select one at login,
                                          // but typically role is fetched from DB after auth.

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  // if (!requestedRole) {
  //   return res.status(400).json({ message: 'Role is required for login.' });
  // }

  try {
    // 1. Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Supabase Auth signIn error:', authError);
      return res.status(401).json({ message: authError.message || 'Invalid login credentials.' });
    }

    if (!authData.user || !authData.session) {
      return res.status(401).json({ message: 'Login failed. User or session not found.' });
    }

    // 2. Fetch user profile from your custom 'users' table to get role and other details
    const { data: userProfile, error: profileError } = await getUserProfileById(authData.user.id);

    if (profileError || !userProfile) {
        console.error('Error fetching user profile or profile not found:', profileError);
        // Optional: Sign out the user from Supabase Auth if their profile is missing, to prevent partial login state
        // await supabase.auth.signOut(); 
        return res.status(401).json({ message: 'Login failed. User profile not found or incomplete.' });
    }
    
    // Optional: If requestedRole was provided, verify it matches the profile's role
    if (requestedRole && userProfile.role !== requestedRole) {
        // await supabase.auth.signOut();
        return res.status(403).json({ message: `Access denied. You are trying to log in as ${requestedRole} but your account role is ${userProfile.role}.` });
    }


    if (userProfile.status === 'INACTIVE' || userProfile.status === 'PENDING_VERIFICATION') {
      // await supabase.auth.signOut();
      return res.status(403).json({ message: `Account is ${userProfile.status}. Please contact support.`});
    }

    // User is authenticated and profile is found
    return res.status(200).json({
      message: 'Login successful!',
      user: userProfile, // Send the full profile from your DB
      session: authData.session, // Supabase session object (contains access_token, refresh_token)
    });

  } catch (error: any) {
    console.error('Error in loginUser controller:', error);
    return res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

// Get Current Authenticated User (from session token)
export const getCurrentUserController = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated or user data not attached." });
    }
    // req.user should be populated by the `protect` middleware with data from your `users` table.
    return res.status(200).json(req.user);
};


// Logout User
export const logoutUser = async (req: Request, res: Response) => {
  const { error } = await supabase.auth.signOut(); // This invalidates the JWT on Supabase's side if possible,
                                                 // but client must also clear its stored token.
  if (error) {
    console.error("Error logging out from Supabase:", error);
    return res.status(500).json({ message: 'Logout failed', error: error.message });
  }
  res.status(200).json({ message: 'Logged out successfully' });
};

// Other auth functions (forgot password, reset password) would typically involve Supabase Auth methods
// and potentially sending emails via Supabase or another service.
// e.g., supabase.auth.resetPasswordForEmail(email)
// e.g., supabase.auth.updateUser({ password: newPassword }) // requires user to be logged in or have a reset token
