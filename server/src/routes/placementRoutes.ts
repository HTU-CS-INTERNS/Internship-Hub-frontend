
import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import { 
    submitPlacement, 
    getStudentPlacement, 
    getPendingPlacementsForHOD, 
    approvePlacementByHOD, 
    rejectPlacementByHOD 
} from '../controllers/placementController';

const router = Router();

/**
 * @route   POST /api/placements
 * @desc    Student submits their internship placement details
 * @access  Private (STUDENT)
 */
router.post('/', protect, authorize('STUDENT'), submitPlacement);

/**
 * @route   GET /api/placements/student
 * @desc    Student gets their current placement details (if any)
 * @access  Private (STUDENT)
 */
router.get('/student', protect, authorize('STUDENT'), getStudentPlacement);

/**
 * @route   GET /api/placements/hod/pending
 * @desc    HOD gets all pending placement submissions for their department
 * @access  Private (HOD)
 */
router.get('/hod/pending', protect, authorize('HOD'), getPendingPlacementsForHOD);

/**
 * @route   PATCH /api/placements/hod/:placementId/approve
 * @desc    HOD approves a placement
 * @access  Private (HOD)
 */
router.patch('/hod/:placementId/approve', protect, authorize('HOD'), approvePlacementByHOD);

/**
 * @route   PATCH /api/placements/hod/:placementId/reject
 * @desc    HOD rejects a placement
 * @access  Private (HOD)
 */
router.patch('/hod/:placementId/reject', protect, authorize('HOD'), rejectPlacementByHOD);


// Add other placement-related routes if needed (e.g., Admin viewing all placements)

export default router;
