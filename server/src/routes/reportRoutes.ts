
import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import {
  createReport,
  getStudentReports,
  getReportById,
  updateReport,
  deleteReport,
  getReportsForReviewer,
  updateReportStatusByReviewer,
} from '../controllers/reportController';

const router = Router();

/**
 * @route   POST /api/reports
 * @desc    Create a new report (for logged-in student)
 * @access  Private (STUDENT)
 */
router.post('/', protect, authorize('STUDENT'), createReport);

/**
 * @route   GET /api/reports
 * @desc    Get all reports for the logged-in student
 * @access  Private (STUDENT)
 */
router.get('/', protect, authorize('STUDENT'), getStudentReports);

/**
 * @route   GET /api/reports/reviewer
 * @desc    Get reports of students assigned to the logged-in lecturer/supervisor/HOD
 * @access  Private (LECTURER, SUPERVISOR, HOD)
 */
router.get('/reviewer', protect, authorize('LECTURER', 'SUPERVISOR', 'HOD'), getReportsForReviewer);

/**
 * @route   GET /api/reports/:reportId
 * @desc    Get a specific report by ID
 * @access  Private (STUDENT, LECTURER, SUPERVISOR, HOD, ADMIN)
 */
router.get('/:reportId', protect, authorize('STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD', 'ADMIN'), getReportById);

/**
 * @route   PUT /api/reports/:reportId
 * @desc    Update a report (student owns it and it's in 'PENDING' status)
 * @access  Private (STUDENT)
 */
router.put('/:reportId', protect, authorize('STUDENT'), updateReport);

/**
 * @route   DELETE /api/reports/:reportId
 * @desc    Delete a report (student owns it and it's in 'PENDING' status)
 * @access  Private (STUDENT)
 */
router.delete('/:reportId', protect, authorize('STUDENT'), deleteReport);

/**
 * @route   PATCH /api/reports/:reportId/status
 * @desc    Update report status (by Lecturer or Supervisor)
 * @access  Private (LECTURER, SUPERVISOR, HOD)
 */
router.patch('/:reportId/status', protect, authorize('LECTURER', 'SUPERVISOR', 'HOD'), updateReportStatusByReviewer);

export default router;
