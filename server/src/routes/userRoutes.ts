
import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import { 
    getAllUsersController, 
    getUserByIdController, 
    updateUserRoleAndStatusController 
} from '../controllers/userController';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Admin gets all users (paginated)
 * @access  Private (ADMIN)
 */
router.get('/', protect, authorize('ADMIN'), getAllUsersController);

/**
 * @route   GET /api/users/:userId
 * @desc    Admin gets a specific user by ID
 * @access  Private (ADMIN)
 */
router.get('/:userId', protect, authorize('ADMIN'), getUserByIdController);

/**
 * @route   PATCH /api/users/:userId/status-role
 * @desc    Admin updates a user's role or status
 * @access  Private (ADMIN)
 */
router.patch('/:userId/status-role', protect, authorize('ADMIN'), updateUserRoleAndStatusController);

// Add routes for creating users (e.g., by Admin/HOD for Lecturers/Supervisors if not self-signup)
// Add routes for general user profile updates (e.g., current user updating their own non-critical info)
// router.put('/profile', protect, updateCurrentUserProfileController);

export default router;
