
import { Router } from 'express';
import { protect, authorize } } from '../middleware/authMiddleware';
import {
  createTask,
  getStudentTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksForLecturer,
  updateTaskStatusByReviewer,
} from '../controllers/taskController';

const router = Router();

/**
 * @route   POST /api/tasks
 * @desc    Create a new task (for logged-in student)
 * @access  Private (STUDENT)
 */
router.post('/', protect, authorize('STUDENT'), createTask);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for the logged-in student
 * @access  Private (STUDENT)
 */
router.get('/', protect, authorize('STUDENT'), getStudentTasks);

/**
 * @route   GET /api/tasks/lecturer
 * @desc    Get tasks of students assigned to the logged-in lecturer
 * @access  Private (LECTURER, HOD)
 */
router.get('/lecturer', protect, authorize('LECTURER', 'HOD'), getTasksForLecturer);

/**
 * @route   GET /api/tasks/supervisor
 * @desc    Get tasks of interns assigned to the logged-in supervisor (Conceptual - requires supervisor_student_assignments table)
 * @access  Private (SUPERVISOR)
 */
// router.get('/supervisor', protect, authorize('SUPERVISOR'), getTasksForSupervisor);


/**
 * @route   GET /api/tasks/:taskId
 * @desc    Get a specific task by ID (student owns it, or lecturer/supervisor has access)
 * @access  Private (STUDENT, LECTURER, SUPERVISOR, HOD) - Access control within controller
 */
router.get('/:taskId', protect, authorize('STUDENT', 'LECTURER', 'SUPERVISOR', 'HOD', 'ADMIN'), getTaskById);

/**
 * @route   PUT /api/tasks/:taskId
 * @desc    Update a task (student owns it and it's in 'PENDING' status)
 * @access  Private (STUDENT) - Access control within controller
 */
router.put('/:taskId', protect, authorize('STUDENT'), updateTask);

/**
 * @route   DELETE /api/tasks/:taskId
 * @desc    Delete a task (student owns it and it's in 'PENDING' status)
 * @access  Private (STUDENT) - Access control within controller
 */
router.delete('/:taskId', protect, authorize('STUDENT'), deleteTask);

/**
 * @route   PATCH /api/tasks/:taskId/status
 * @desc    Update task status (by Lecturer or Supervisor)
 * @access  Private (LECTURER, SUPERVISOR, HOD)
 */
router.patch('/:taskId/status', protect, authorize('LECTURER', 'SUPERVISOR', 'HOD'), updateTaskStatusByReviewer);


export default router;
