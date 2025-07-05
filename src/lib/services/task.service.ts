
'use client';

import type { DailyTask, AttachmentData } from '@/types';
import { format } from 'date-fns';
import { apiClient } from '../api-client';

// Helper to convert File to AttachmentData
async function fileToAttachmentData(file: File): Promise<AttachmentData> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            dataUri: reader.result as string,
        });
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export async function createTask(
  taskData: Omit<DailyTask, 'id' | 'studentId' | 'status' | 'date'> & { date: string; attachments?: AttachmentData[] }
): Promise<DailyTask> {
  try {
    // First, get the user's internship ID
    const internship = await apiClient.getMyInternship();
    if (!internship) {
      throw new Error('No active internship found for current user');
    }

    const payload = {
      task_date: taskData.date,
      description: taskData.description,
      expected_outcome: taskData.outcomes,
      learning_objective: taskData.learningObjectives,
    };

    const response = await apiClient.createDailyTask(internship.id, payload);
    
    // Map backend response to frontend format
    return {
      id: response.id.toString(),
      studentId: internship.student_id?.toString() || '',
      description: response.description,
      date: response.task_date,
      status: response.status || 'PENDING',
      outcomes: response.expected_outcome || '',
      learningObjectives: response.learning_objective || '',
      attachments: taskData.attachments || [],
      departmentOutcomeLink: taskData.departmentOutcomeLink,
    };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

export async function getTasksForStudent(studentId?: string): Promise<DailyTask[]> {
  try {
    // Get the user's internship ID
    const internship = await apiClient.getMyInternship();
    if (!internship) {
      console.warn('No active internship found for current user');
      return [];
    }

    const response = await apiClient.getDailyTasks(internship.id);
    
    // Map backend response to frontend format
    return response.map((task: any) => ({
      id: task.id.toString(),
      studentId: internship.student_id?.toString() || '',
      description: task.description,
      date: task.task_date,
      status: task.status || 'PENDING',
      outcomes: task.expected_outcome || '',
      learningObjectives: task.learning_objective || '',
      attachments: [],
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

export async function updateTaskStatus(taskId: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
  try {
    // Get the user's internship ID
    const internship = await apiClient.getMyInternship();
    if (!internship) {
      throw new Error('No active internship found for current user');
    }

    await apiClient.updateDailyTask(internship.id, parseInt(taskId), { status });
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
}

export async function getTaskById(taskId: string): Promise<DailyTask | null> {
  try {
    // Get the user's internship ID
    const internship = await apiClient.getMyInternship();
    if (!internship) {
      return null;
    }

    const response = await apiClient.getDailyTask(internship.id, parseInt(taskId));
    
    return {
      id: response.id.toString(),
      studentId: internship.student_id?.toString() || '',
      description: response.description,
      date: response.task_date,
      status: response.status || 'PENDING',
      outcomes: response.expected_outcome || '',
      learningObjectives: response.learning_objective || '',
      attachments: [],
    };
  } catch (error) {
    console.error('Error fetching task by ID:', error);
    return null;
  }
}

export async function getTasksForSupervisor(): Promise<DailyTask[]> {
  try {
    // For supervisors, we'll need to get tasks from all their assigned internships
    // This might require a different endpoint or getting all internships first
    console.warn('getTasksForSupervisor not fully implemented - needs backend endpoint for supervisor tasks');
    return [];
  } catch (error) {
    console.error('Error fetching tasks for supervisor:', error);
    return [];
  }
}
