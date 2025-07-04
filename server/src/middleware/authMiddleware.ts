
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabaseClient';
import type { UserProfileData } from '../services/userService';

// Define a custom request type that includes the user property
export interface AuthenticatedRequest extends Request {
  user?: UserProfileData; 
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Token validation error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }

    // Attach user to the request object for use in subsequent controllers
    // Fetch additional profile details from the 'users' table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profileError || !userProfile) {
      return res.status(401).json({ message: 'User profile not found for token.'});
    }
    req.user = userProfile;

    next();
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return res.status(401).json({ message: 'Not authorized, token processing error' });
  }
};

// Example: Middleware to check for a specific role
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: User role '${req.user?.role}' is not authorized for this resource. Required roles: ${roles.join(', ')}` });
    }
    next();
  };
};
