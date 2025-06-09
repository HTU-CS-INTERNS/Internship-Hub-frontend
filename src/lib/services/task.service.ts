
'use client';

import type { DailyTask } from '@/types';
import { format } from 'date-fns';

const TASKS_STORAGE_KEY = 'internshipTrack_dailyTasks_v1';

// Helper to get current studentId (assuming it's stored as email in localStorage)
const getCurrentStudentId = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem('userEmail') || 'unknown_student';
  }
  return 'unknown_student';
};

async function getAllTasksFromStorage(): Promise<DailyTask[]> {
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async
  if (typeof window === "undefined") return [];
  const tasksRaw = localStorage.getItem(TASKS_STORAGE_KEY);
  return tasksRaw ? JSON.parse(tasksRaw) : [];
}

async function saveAllTasksToStorage(tasks: DailyTask[]): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async
  if (typeof window === "undefined") return;
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

export async function createTask(
  taskData: Omit<DailyTask, 'id' | 'studentId' | 'status' | 'date'> & { date: Date }
): Promise<DailyTask> {
  const allTasks = await getAllTasksFromStorage();
  const studentId = getCurrentStudentId();
  const newTask: DailyTask = {
    ...taskData,
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    studentId,
    status: 'PENDING', // Initial status for a newly created task
    date: format(taskData.date, 'yyyy-MM-dd'), // Ensure date is stored as string
    attachments: taskData.attachments?.map(file => (file as File).name) || [], // Store file names for simplicity
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

export async function updateTask(taskId: string, updates: Partial<Omit<DailyTask, 'id' | 'studentId' | 'date'> & { date?: Date }>): Promise<DailyTask | null> {
  const allTasks = await getAllTasksFromStorage();
  const taskIndex = allTasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return null;
  }
  
  const updatedTaskData = { ...allTasks[taskIndex] };

  if (updates.date) {
    updatedTaskData.date = format(updates.date, 'yyyy-MM-dd');
  }
  if (updates.description) updatedTaskData.description = updates.description;
  if (updates.outcomes) updatedTaskData.outcomes = updates.outcomes;
  if (updates.learningObjectives) updatedTaskData.learningObjectives = updates.learningObjectives;
  if (updates.departmentOutcomeLink !== undefined) updatedTaskData.departmentOutcomeLink = updates.departmentOutcomeLink;
  if (updates.attachments) updatedTaskData.attachments = updates.attachments.map(file => (file as File).name);
  // Status updates should be handled by a separate, more specific function if needed for supervisor/lecturer actions

  allTasks[taskIndex] = updatedTaskData;
  await saveAllTasksToStorage(allTasks);
  return allTasks[taskIndex];
}


export async function updateTaskStatus(
  taskId: string,
  newStatus: DailyTask['status'],
  comments?: string,
  commenterRole?: 'supervisor' | 'lecturer' // To distinguish comment types
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
    // Potentially clear other role's comments or append, based on business logic
  }

  await saveAllTasksToStorage(allTasks);
  return allTasks[taskIndex];
}

// Initialize with DUMMY_TASKS if no tasks are in localStorage (for first-time use)
export async function initializeDefaultTasksIfNeeded() {
  if (typeof window !== "undefined") {
    const tasksRaw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!tasksRaw || JSON.parse(tasksRaw).length === 0) {
      const studentId = getCurrentStudentId();
      const defaultTasks: DailyTask[] = [
        { id: 'task1_default', date: '2024-07-28', description: 'Develop user authentication module.', outcomes: 'Authentication flow completed.', learningObjectives: 'Learned JWT implementation.', studentId: studentId, status: 'APPROVED', departmentOutcomeLink: "DO1.2" },
        { id: 'task2_default', date: '2024-07-29', description: 'Design database schema for posts.', outcomes: 'Schema designed and reviewed.', learningObjectives: 'Understanding of relational databases.', studentId: studentId, status: 'SUBMITTED' },
      ];
      await saveAllTasksToStorage(defaultTasks);
      console.log("Initialized default tasks for student:", studentId);
    }
  }
}
// Call this once, perhaps in a main layout or a global context setup, if needed.
// For simplicity, pages using tasks can call it in their useEffect if they want to ensure data exists.
// initializeDefaultTasksIfNeeded(); // Auto-init might be too aggressive here, let pages handle it.

    