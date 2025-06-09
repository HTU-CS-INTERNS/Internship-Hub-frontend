
import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';
// import { createUserProfile, findUserByEmailWithRole } from '../services/userService'; // Example service

// --- Student Registration (Conceptual) ---
// This assumes prior verification steps (School ID, OTP) have happened on the frontend
// and this backend endpoint is called to finalize account creation.
export const registerStudent = async (req: Request, res: Response) => {
  const { email, password, name, facultyId, departmentId, schoolId } = req.body;

  if (!email || !password || !name || !facultyId || !departmentId || !schoolId) {
    return res.status(400).json({ message: 'Missing required fields for student registration.' });
  }

  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      // options: { data: { full_name: name } } // You can add custom user metadata here
    });

    if (authError) {
      console.error('Supabase Auth signUp error:', authError);
      return res.status(400).json({ message: authError.message });
    }

    if (!authData.user) {
      return res.status(500).json({ message: 'User not created in Supabase Auth.' });
    }

    const userId = authData.user.id;

    // 2. Create user profile in your custom 'users' table (or similar)
    // You'll need a userService function like createUserProfile for this.
    // Example:
    // const profileData = {
    //   id: userId, // Ensure this matches Supabase Auth user ID
    //   email,
    //   name,
    //   role: 'STUDENT',
    //   faculty_id: facultyId,
    //   department_id: departmentId,
    //   school_id: schoolId,
    //   // other fields...
    // };
    // const { data: profile, error: profileError } = await createUserProfile(profileData);
    // if (profileError) {
    //   console.error('Error creating user profile:', profileError);
    //   // Consider deleting the Supabase Auth user if profile creation fails to keep things consistent
    //   // await supabase.auth.admin.deleteUser(userId); // Requires service_role key
    //   return res.status(500).json({ message: 'Failed to create user profile.' });
    // }

    // For now, just log success and return user info (without JWT, which you'd add)
    console.log('Student registered successfully (simulated profile creation):', authData.user);
    return res.status(201).json({
      message: 'Student registered successfully! Profile creation simulated.',
      user: { id: userId, email: authData.user.email, name }, // Simplify user object
    });

  } catch (error) {
    console.error('Error in registerStudent controller:', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
};

// --- User Login (Conceptual) ---
export const loginUser = async (req: Request, res: Response) => {
  const { email, password, role } = req.body; // Role might be used to fetch role-specific data

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  if (!role) {
    return res.status(400).json({ message: 'Role is required for login.' });
  }


  try {
    // 1. Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Supabase Auth signIn error:', authError);
      return res.status(401).json({ message: authError.message });
    }

    if (!authData.user || !authData.session) {
      return res.status(401).json({ message: 'Login failed. User or session not found.' });
    }

    // 2. Fetch user profile from your custom 'users' table to confirm role and get other details
    // You would typically have a function like `findUserByEmailWithRole(email, role)` in userService
    // const userProfile = await findUserByEmailWithRole(email, role);
    // if (!userProfile) {
    //    return res.status(401).json({ message: 'User not found with the specified role or login failed.' });
    // }

    // For demonstration, we'll assume the role matches and return basic info
    // In a real app, you'd generate a JWT here if not using Supabase's session directly on client.
    console.log('User logged in successfully:', authData.user);
    return res.status(200).json({
      message: 'Login successful!',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        // name: userProfile.name, // from your database
        role: role, // This should come from your DB, not blindly trusted from request
        // facultyId: userProfile.faculty_id, // Example
        // departmentId: userProfile.department_id, // Example
      },
      session: authData.session, // Supabase session object (contains access_token, refresh_token)
    });

  } catch (error) {
    console.error('Error in loginUser controller:', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

// Add other auth-related controller functions here (e.g., logout, forgotPassword, resetPassword, getCurrentUser)
