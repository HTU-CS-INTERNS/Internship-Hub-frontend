'use client';

import type { DailyTask, AttachmentData } from '@/types';
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
    taskData: Omit<DailyTask, 'id' | 'studentId' | 'status' | 'date'> & { 
        date: string; 
        attachments?: AttachmentData[] 
    }
): Promise<DailyTask> {
    try {
        // First, get the user's internship with proper error handling
        const internship = await apiClient.getMyInternship();
        
        if (!internship || !internship.id) {
            throw new Error('No active internship found or internship ID is missing');
        }

        // Convert internship ID to number with validation
        const internshipId = parseInt(internship.id.toString(), 10);
        if (isNaN(internshipId)) {
            throw new Error(`Invalid internship ID format: ${internship.id}`);
        }

        // Prepare payload with null checks
        const payload = {
            task_date: taskData.date || new Date().toISOString().split('T')[0], // Default to today if missing
            description: taskData.description || '',
            expected_outcome: taskData.outcomes || '',
            learning_objective: taskData.learningObjectives || '',
            department_outcome_link: taskData.departmentOutcomeLink || null,
            attachments: taskData.attachments || [],
        };

        console.debug('Creating task with:', { 
            internshipId,
            payload 
        });

        const response = await apiClient.createDailyTask(internshipId, payload);

        if (!response || !response.id) {
            throw new Error('Invalid response from server when creating task');
        }

        return {
            id: response.id.toString(),
            studentId: internship.student_id?.toString() || '',
            description: response.description || payload.description,
            date: response.task_date || payload.task_date,
            status: response.status || 'PENDING',
            outcomes: response.expected_outcome || payload.expected_outcome,
            learningObjectives: response.learning_objective || payload.learning_objective,
            attachments: response.attachments || payload.attachments,
            departmentOutcomeLink: response.department_outcome_link || payload.department_outcome_link,
        };
    } catch (error) {
        console.error('Failed to create task:', error);
        throw new Error(
            error instanceof Error 
                ? error.message 
                : 'An unknown error occurred while creating the task'
        );
    }
}

export async function updateTask(
    taskId: string,
    taskData: Partial<Omit<DailyTask, 'id' | 'studentId'>>
): Promise<DailyTask> {
    try {
        const internship = await apiClient.getMyInternship();
        if (!internship) {
            throw new Error('No active internship found for current user');
        }

        // Convert IDs to numbers
        const internshipId = Number(internship.id);
        const numericTaskId = Number(taskId);
        
        if (isNaN(internshipId) || isNaN(numericTaskId)) {
            throw new Error(`Invalid IDs - internship: ${internship.id}, task: ${taskId}`);
        }

        const payload = {
            task_date: taskData.date,
            description: taskData.description,
            expected_outcome: taskData.outcomes,
            learning_objective: taskData.learningObjectives,
            department_outcome_link: taskData.departmentOutcomeLink || null,
            status: taskData.status,
            attachments: taskData.attachments || [],
        };

        console.log('Updating task with payload:', {
            internshipId,
            taskId: numericTaskId,
            payload
        });

        const response = await apiClient.updateDailyTask(internshipId, numericTaskId, payload);

        return {
            id: String(response.id),
            studentId: String(internship.student_id || ''),
            description: response.description,
            date: response.task_date,
            status: response.status || 'PENDING',
            outcomes: response.expected_outcome || '',
            learningObjectives: response.learning_objective || '',
            attachments: response.attachments || [],
            departmentOutcomeLink: response.department_outcome_link || '',
        };
    } catch (error) {
        console.error('Error updating task:', error);
        throw new Error(`Failed to update task: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function getTasksForStudent(studentId?: string): Promise<DailyTask[]> {
    try {
        const internship = await apiClient.getMyInternship();
        if (!internship) {
            console.warn('No active internship found for current user');
            return [];
        }

        const internshipId = Number(internship.id);
        if (isNaN(internshipId)) {
            throw new Error(`Invalid internship ID: ${internship.id}`);
        }

        const response = await apiClient.getDailyTasks(internshipId);

        return response.map((task: any) => ({
            id: String(task.id),
            studentId: String(internship.student_id || ''),
            description: task.description,
            date: task.task_date,
            status: task.status || 'PENDING',
            outcomes: task.expected_outcome || '',
            learningObjectives: task.learning_objective || '',
            attachments: task.attachments || [],
            departmentOutcomeLink: task.department_outcome_link || '',
        }));
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
}

export async function updateTaskStatus(
    taskId: string, 
    status: 'pending' | 'approved' | 'rejected'
): Promise<void> {
    try {
        const internship = await apiClient.getMyInternship();
        if (!internship) {
            throw new Error('No active internship found for current user');
        }

        const internshipId = Number(internship.id);
        const numericTaskId = Number(taskId);
        
        if (isNaN(internshipId) || isNaN(numericTaskId)) {
            throw new Error(`Invalid IDs - internship: ${internship.id}, task: ${taskId}`);
        }

        await apiClient.updateDailyTask(internshipId, numericTaskId, { status });
    } catch (error) {
        console.error('Error updating task status:', error);
        throw new Error(`Failed to update task status: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function getTaskById(taskId: string): Promise<DailyTask | null> {
    try {
        const internship = await apiClient.getMyInternship();
        if (!internship) {
            return null;
        }

        const internshipId = Number(internship.id);
        const numericTaskId = Number(taskId);
        
        if (isNaN(internshipId) || isNaN(numericTaskId)) {
            console.error(`Invalid IDs - internship: ${internship.id}, task: ${taskId}`);
            return null;
        }

        const response = await apiClient.getDailyTask(internshipId, numericTaskId);

        return {
            id: String(response.id),
            studentId: String(internship.student_id || ''),
            description: response.description,
            date: response.task_date,
            status: response.status || 'PENDING',
            outcomes: response.expected_outcome || '',
            learningObjectives: response.learning_objective || '',
            attachments: response.attachments || [],
            departmentOutcomeLink: response.department_outcome_link || '',
        };
    } catch (error) {
        console.error('Error fetching task by ID:', error);
        return null;
    }
}

export async function getTasksForSupervisor(): Promise<DailyTask[]> {
    try {
        // Implementation depends on your backend API
        // This should use a different endpoint than student tasks
        const response = await apiClient.getSupervisorTasks();
        
        return response.map((task: any) => ({
            id: String(task.id),
            studentId: String(task.student_id || ''),
            description: task.description,
            date: task.task_date,
            status: task.status || 'PENDING',
            outcomes: task.expected_outcome || '',
            learningObjectives: task.learning_objective || '',
            attachments: task.attachments || [],
            departmentOutcomeLink: task.department_outcome_link || '',
        }));
    } catch (error) {
        console.error('Error fetching supervisor tasks:', error);
        return [];
    }
}