
'use client';

import type { DailyTask, AttachmentData } from '@/types';
import { format } from 'date-fns';

const TASKS_STORAGE_KEY = 'internshipTrack_dailyTasks_v2'; // Updated key for new structure

const getCurrentStudentId = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem('userEmail') || 'unknown_student';
  }
  return 'unknown_student';
};

async function getAllTasksFromStorage(): Promise<DailyTask[]> {
  await new Promise(resolve => setTimeout(resolve, 50)); 
  if (typeof window === "undefined") return [];
  const tasksRaw = localStorage.getItem(TASKS_STORAGE_KEY);
  return tasksRaw ? JSON.parse(tasksRaw) : [];
}

async function saveAllTasksToStorage(tasks: DailyTask[]): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 50)); 
  if (typeof window === "undefined") return;
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

// Helper to convert File to AttachmentData (already in forms, but good for service if needed)
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
  taskData: Omit<DailyTask, 'id' | 'studentId' | 'status' | 'date'> & { date: string; attachments: AttachmentData[] }
): Promise<DailyTask> {
  const allTasks = await getAllTasksFromStorage();
  const studentId = getCurrentStudentId();
  const newTask: DailyTask = {
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    studentId,
    status: 'SUBMITTED', // Tasks are submitted for review, not just pending.
    date: taskData.date, // Already formatted string from form
    description: taskData.description,
    outcomes: taskData.outcomes,
    learningObjectives: taskData.learningObjectives,
    departmentOutcomeLink: taskData.departmentOutcomeLink,
    attachments: taskData.attachments, // Now expects AttachmentData[]
  };
  allTasks.push(newTask);
  await saveAllTasksToStorage(allTasks);
  return newTask;
}

export async function getTasksByStudent(studentId: string): Promise<DailyTask[]> {
  const allTasks = await getAllTasksFromStorage();
  return allTasks.filter(task => task.studentId === studentId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getTaskById(taskId: string): Promise<DailyTask | null> {
  const allTasks = await getAllTasksFromStorage();
  const task = allTasks.find(t => t.id === taskId) || null;
  return task;
}

export async function updateTask(
    taskId: string, 
    updates: Partial<Omit<DailyTask, 'id' | 'studentId' | 'status' | 'date'>> & { date?: string; attachments?: AttachmentData[] }
): Promise<DailyTask | null> {
  const allTasks = await getAllTasksFromStorage();
  const taskIndex = allTasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return null;
  }
  
  const updatedTaskData = { ...allTasks[taskIndex] };

  if (updates.date) updatedTaskData.date = updates.date; // Expecting formatted string
  if (updates.description !== undefined) updatedTaskData.description = updates.description;
  if (updates.outcomes !== undefined) updatedTaskData.outcomes = updates.outcomes;
  if (updates.learningObjectives !== undefined) updatedTaskData.learningObjectives = updates.learningObjectives;
  if (updates.departmentOutcomeLink !== undefined) updatedTaskData.departmentOutcomeLink = updates.departmentOutcomeLink;
  
  if (updates.attachments !== undefined) {
    updatedTaskData.attachments = updates.attachments;
  }
  
  // When a task is updated, it should go back to SUBMITTED status for re-review
  updatedTaskData.status = 'SUBMITTED';

  allTasks[taskIndex] = updatedTaskData;
  await saveAllTasksToStorage(allTasks);
  return allTasks[taskIndex];
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: DailyTask['status'],
  comments?: string,
  commenterRole?: 'supervisor' | 'lecturer'
): Promise<DailyTask | null> {
  const allTasks = await getAllTasksFromStorage();
  const taskIndex = allTasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    console.error(`Task with ID ${taskId} not found for status update.`);
    return null;
  }

  allTasks[taskIndex].status = newStatus;
  if (comments) {
    if (commenterRole === 'supervisor') {
      allTasks[taskIndex].supervisorComments = comments;
    } else if (commenterRole === 'lecturer') {
      allTasks[taskIndex].lecturerComments = comments;
    }
  }

  await saveAllTasksToStorage(allTasks);
  return allTasks[taskIndex];
}

export async function getPendingTasksForSupervisor(supervisorId: string): Promise<DailyTask[]> {
  const allTasks = await getAllTasksFromStorage();
  // In a real app, you would fetch a list of studentIds assigned to this supervisor.
  // For our mock, we assume the supervisor is assigned to student 'stu1'.
  const assignedStudentIds = ['stu1']; 
  return allTasks.filter(task => 
    assignedStudentIds.includes(task.studentId) && 
    (task.status === 'SUBMITTED' || task.status === 'PENDING')
  ).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // oldest first
}


export async function initializeDefaultTasksIfNeeded() {
  if (typeof window !== "undefined") {
    const tasksRaw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!tasksRaw || JSON.parse(tasksRaw).length === 0) {
      const studentId = 'stu1'; // Use a consistent ID for the default tasks
      const sampleDataUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      const defaultTasks: DailyTask[] = [
        { 
          id: 'task1_default', 
          date: format(new Date(new Date().setDate(new Date().getDate() - 2)), 'yyyy-MM-dd'), 
          description: 'Develop user authentication module for project Alpha. Included JWT implementation.', 
          outcomes: 'Authentication flow completed. All endpoints tested and functional.', 
          learningObjectives: 'Learned JWT implementation best practices and secure coding for authentication.', 
          studentId: studentId, 
          status: 'APPROVED', 
          departmentOutcomeLink: "DO1.2 - Applied Security Principles", 
          attachments: [{ name: "auth_diagram.png", type: "image/png", size: 123, dataUri: sampleDataUri }],
          supervisorComments: "Excellent work on this, looks production-ready."
        },
        { 
          id: 'task2_default', 
          date: format(new Date(new Date().setDate(new Date().getDate() - 1)), 'yyyy-MM-dd'), 
          description: 'Design database schema for posts and comments feature. Iterated with team.', 
          outcomes: 'Schema designed and reviewed by senior dev. Ready for implementation.', 
          learningObjectives: 'Understanding of relational database design for social features. Experience with normalization.', 
          studentId: studentId, 
          status: 'SUBMITTED', 
          attachments: [] 
        },
         { 
          id: 'task3_default', 
          date: format(new Date(), 'yyyy-MM-dd'), 
          description: 'Write API documentation for the authentication module.', 
          outcomes: 'Initial draft of OpenAPI spec written.', 
          learningObjectives: 'Practiced writing technical documentation using OpenAPI standards.', 
          studentId: studentId, 
          status: 'SUBMITTED', 
          attachments: [] 
        },
      ];
      await saveAllTasksToStorage(defaultTasks);
      console.log("Initialized default tasks for student:", studentId);
    }
  }
}
