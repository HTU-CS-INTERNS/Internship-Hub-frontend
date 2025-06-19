
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabaseClient';

// Define a custom request type that includes the user property
export interface AuthenticatedRequest extends Request {
  user?: any; // Define a more specific type for your user object from Supabase
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
    // You might want to fetch additional profile details from your 'users' table here
    // For example:
    // const { data: userProfile, error: profileError } = await supabase
    //   .from('users')
    //   .select('*')
    //   .eq('id', user.id)
    //   .single();
    // if (profileError || !userProfile) {
    //   return res.status(401).json({ message: 'User profile not found for token.'});
    // }
    // req.user = userProfile;

    req.user = user; // For now, just attaching the Supabase auth user

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
      // Note: req.user.role depends on you fetching profile and attaching it in `protect` middleware
      // Supabase auth.getUser() user object might not have 'role' directly unless it's in app_metadata.
      // You'd typically fetch the role from your own 'users' table.
      return res.status(403).json({ message: 'Forbidden: User does not have the required role' });
    }
    next();
  };
};
