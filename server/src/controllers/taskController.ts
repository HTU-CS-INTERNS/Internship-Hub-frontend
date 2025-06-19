
import { Request, Response } from 'express';
import * as taskService from '../services/taskService'; // Assuming taskService.ts in services folder
import type { AuthenticatedRequest } from '../middleware/authMiddleware';
import type { UserRole } from '../../../src/types';

// Create a new task
export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    // Basic validation (use a library like Zod for robust validation)
    const { date, description, outcomes, learningObjectives, departmentOutcomeLink, attachments } = req.body;
    if (!date || !description || !outcomes || !learningObjectives) {
      return res.status(400).json({ message: 'Missing required task fields' });
    }

    const taskData = { date, description, outcomes, learningObjectives, departmentOutcomeLink, attachments };
    const { data: task, error } = await taskService.createTaskForStudent(studentId, taskData);

    if (error) throw error;
    res.status(201).json(task);
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
};

// Get all tasks for the logged-in student
export const getStudentTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const { data: tasks, error } = await taskService.getTasksByStudentId(studentId);
    if (error) throw error;
    res.status(200).json(tasks);
  } catch (error: any) {
    console.error('Error fetching student tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
};

// Get a specific task by ID
export const getTaskById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user?.id;
    const userRole = req.user?.role as UserRole;

    if (!userId) return res.status(401).json({ message: 'User not authenticated' });
    
    const { data: task, error } = await taskService.getTaskByIdAndVerifyAccess(taskId, userId, userRole);
    if (error) throw error;
    if (!task) return res.status(404).json({ message: 'Task not found or access denied' });
    
    res.status(200).json(task);
  } catch (error: any) {
    console.error('Error fetching task by ID:', error);
    if (error.message.includes('denied')) return res.status(403).json({ message: error.message });
    res.status(500).json({ message: 'Failed to fetch task', error: error.message });
  }
};

// Update a task
export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const taskId = req.params.taskId;
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ message: 'User not authenticated' });

    const updates = req.body; // { date, description, outcomes, learningObjectives, ... }
    const { data: task, error } = await taskService.updateTaskByStudent(taskId, studentId, updates);

    if (error) throw error;
    if (!task) return res.status(404).json({ message: 'Task not found, not owned by user, or not in PENDING status.' });
    
    res.status(200).json(task);
  } catch (error: any) {
    console.error('Error updating task:', error);
     if (error.message.includes('denied') || error.message.includes('not allowed')) return res.status(403).json({ message: error.message });
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
};

// Delete a task
export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const taskId = req.params.taskId;
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ message: 'User not authenticated' });

    const { data, error } = await taskService.deleteTaskByStudent(taskId, studentId);
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Task not found, not owned by user, or not in PENDING status.' });

    res.status(204).send(); // No content
  } catch (error: any) {
    console.error('Error deleting task:', error);
    if (error.message.includes('denied') || error.message.includes('not allowed')) return res.status(403).json({ message: error.message });
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
};


// Get tasks for students assigned to a lecturer
export const getTasksForLecturer = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const lecturerId = req.user?.id;
        if (!lecturerId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        // You'll need to implement logic in taskService to fetch students assigned to this lecturer,
        // then fetch tasks for those students.
        const { data: tasks, error } = await taskService.getTasksForLecturerOrHod(lecturerId, req.user?.role as UserRole);
        if (error) throw error;
        res.status(200).json(tasks);
    } catch (error: any) {
        console.error('Error fetching tasks for lecturer:', error);
        res.status(500).json({ message: 'Failed to fetch tasks for lecturer', error: error.message });
    }
};

// Update task status by reviewer (Lecturer/Supervisor/HOD)
export const updateTaskStatusByReviewer = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const taskId = req.params.taskId;
        const reviewerId = req.user?.id;
        const reviewerRole = req.user?.role as UserRole; // LECTURER, SUPERVISOR, HOD
        const { status, comments } = req.body; // status should be 'APPROVED' or 'REJECTED'

        if (!reviewerId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }

        const { data: task, error } = await taskService.updateTaskStatusByReviewer(taskId, reviewerId, reviewerRole, status, comments);

        if (error) throw error;
        if (!task) return res.status(404).json({ message: 'Task not found or update failed (e.g., access denied, wrong current status).' });
        
        res.status(200).json(task);
    } catch (error: any) {
        console.error('Error updating task status:', error);
        if (error.message.includes('denied') || error.message.includes('not allowed')) return res.status(403).json({ message: error.message });
        res.status(500).json({ message: 'Failed to update task status', error: error.message });
    }
};
