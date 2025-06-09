
import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import {
  createOrUpdateEvaluation,
  getEvaluationById,
  getEvaluationsForStudent,
  getEvaluationsByEvaluator,
  // getEvaluationsForDepartment, // For HOD/Admin
} from '../controllers/evaluationController';

const router = Router();

/**
 * @route   POST /api/evaluations
 * @desc    Create or Update an evaluation for a student (by Lecturer or Supervisor)
 * @access  Private (LECTURER, SUPERVISOR)
 */
router.post('/', protect, authorize('LECTURER', 'SUPERVISOR'), createOrUpdateEvaluation);

/**
 * @route   GET /api/evaluations/:evaluationId
 * @desc    Get a specific evaluation by its ID
 * @access  Private (STUDENT, LECTURER, SUPERVISOR, HOD, ADMIN)
 */
router.get('/:evaluationId', protect, authorize('STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD', 'ADMIN'), getEvaluationById);

/**
 * @route   GET /api/evaluations/student/:studentId
 * @desc    Get all evaluations for a specific student
 * @access  Private (STUDENT can see their own, LECTURER/SUPERVISOR/HOD/ADMIN can see for students they oversee)
 */
router.get('/student/:studentId', protect, authorize('STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD', 'ADMIN'), getEvaluationsForStudent);

/**
 * @route   GET /api/evaluations/evaluator/:evaluatorId
 * @desc    Get all evaluations made by a specific evaluator (Lecturer/Supervisor sees their own)
 * @access  Private (LECTURER, SUPERVISOR, HOD, ADMIN)
 */
router.get('/evaluator/:evaluatorId', protect, authorize('LECTURER', 'SUPERVISOR', 'HOD', 'ADMIN'), getEvaluationsByEvaluator);

// Example for HOD/Admin - requires more complex permission logic
// router.get('/department/:departmentId', protect, authorize('HOD', 'ADMIN'), getEvaluationsForDepartment);


export default router;
