
import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import {
  createCheckIn,
  getStudentCheckIns,
  getCheckInsForSupervisor,
  verifyCheckInBySupervisor,
} from '../controllers/checkInController';

const router = Router();

/**
 * @route   POST /api/check-ins
 * @desc    Student creates a new check-in
 * @access  Private (STUDENT)
 */
router.post('/', protect, authorize('STUDENT'), createCheckIn);

/**
 * @route   GET /api/check-ins/student
 * @desc    Student gets their check-in history
 * @access  Private (STUDENT)
 */
router.get('/student', protect, authorize('STUDENT'), getStudentCheckIns);

/**
 * @route   GET /api/check-ins/supervisor
 * @desc    Supervisor gets check-ins for their assigned interns
 * @access  Private (SUPERVISOR)
 */
router.get('/supervisor', protect, authorize('SUPERVISOR'), getCheckInsForSupervisor);

/**
 * @route   PATCH /api/check-ins/:checkInId/verify
 * @desc    Supervisor verifies or flags a check-in
 * @access  Private (SUPERVISOR)
 */
router.patch('/:checkInId/verify', protect, authorize('SUPERVISOR'), verifyCheckInBySupervisor);

export default router;
