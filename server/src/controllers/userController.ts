
import { Request, Response } from 'express';
import * as userService from '../services/userService';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';
import type { UserRole } from '../../../src/types';


// Admin: Get all users
export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    // Add filtering/sorting query params as needed

    const { data, error, count } = await userService.getAllUsers(page, limit);
    if (error) throw error;
    res.status(200).json({ users: data, total: count, page, limit });
  } catch (error: any) {
    console.error('Error in getAllUsersController:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// Admin: Get user by ID
export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { data, error } = await userService.getUserProfileById(userId); // This function already exists
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error in getUserByIdController:', error);
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
};

// Admin: Update user role or status
export const updateUserRoleAndStatusController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { role, status } = req.body as { role?: UserRole, status?: userService.UserProfileData['status']};

    if (!role && !status) {
        return res.status(400).json({ message: 'Either role or status must be provided for update.' });
    }

    const { data, error } = await userService.updateUserRoleAndStatus(userId, role, status);
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'User not found or update failed.' });
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error in updateUserRoleAndStatusController:', error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};

// Controller for current user to update their own profile (less critical fields)
export const updateCurrentUserProfileController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "User not authenticated." });

        const { name, contactNumber, avatarUrl /* other editable fields */ } = req.body;
        const updates: Partial<userService.UserProfileData> = {};
        if (name) updates.name = name;
        if (contactNumber) updates.contact_number = contactNumber;
        if (avatarUrl) updates.avatar_url = avatarUrl;
        // Prevent role, email, faculty, department changes through this endpoint

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No update data provided." });
        }
        
        const { data, error } = await userService.updateUserProfileInDB(userId, updates);
        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        console.error('Error updating current user profile:', error);
        res.status(500).json({ message: "Failed to update profile.", error: error.message });
    }
};
