
'use client'; 

import type { DailyTask, AttachmentData } from '@/types';

// Use a consistent key for localStorage
const TASKS_STORAGE_KEY_PREFIX = 'internshipHub_tasks_';

function getStorageKey(studentId: string): string {
    return `${TASKS_STORAGE_KEY_PREFIX}${studentId}`;
}

// Function to safely get data from localStorage
const getTasksFromStorage = (studentId: string): DailyTask[] => {
  if (typeof window === "undefined") return [];
  const key = getStorageKey(studentId);
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse tasks from localStorage", e);
      return [];
    }
  }
  return [];
};

// Function to safely set data to localStorage
const setTasksInStorage = (studentId: string, tasks: DailyTask[]): void => {
  if (typeof window === "undefined") return;
  const key = getStorageKey(studentId);
  try {
    localStorage.setItem(key, JSON.stringify(tasks));
  } catch(e) {
    console.error("Failed to save tasks to localStorage", e);
  }
};

export async function createTask(
  taskData: Omit<DailyTask, 'id' | 'studentId' | 'status'>
): Promise<DailyTask> {
  const studentId = typeof window !== "undefined" ? localStorage.getItem('userEmail') || 'unknown_student' : 'unknown_student';
  const allTasks = getTasksFromStorage(studentId);
  
  const newTask: DailyTask = {
    ...taskData,
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    studentId,
    status: 'SUBMITTED', // Default status on creation
  };

  allTasks.unshift(newTask); // Add to the beginning of the list
  setTasksInStorage(studentId, allTasks);
  
  await new Promise(resolve => setTimeout(resolve, 300));
  return newTask;
}

export async function updateTask(
    taskId: string, 
    updateData: Partial<Omit<DailyTask, 'id' | 'studentId'>>
): Promise<DailyTask | null> {
    const studentId = typeof window !== "undefined" ? localStorage.getItem('userEmail') || 'unknown_student' : 'unknown_student';
    const allTasks = getTasksFromStorage(studentId);
    
    const taskIndex = allTasks.findIndex(t => t.id === taskId);
    
    if (taskIndex > -1) {
        // Merge existing data with new data
        const updatedTask = { ...allTasks[taskIndex], ...updateData };
        allTasks[taskIndex] = updatedTask;
        setTasksInStorage(studentId, allTasks);
        await new Promise(resolve => setTimeout(resolve, 200));
        return updatedTask;
    }
    
    return null; // Task not found
}

// This function now gets tasks for the currently logged-in student (or a specified one)
export async function getTasksForStudent(studentId?: string): Promise<DailyTask[]> {
  const id = studentId || (typeof window !== "undefined" ? localStorage.getItem('userEmail') || 'unknown_student' : 'unknown_student');
  const tasks = getTasksFromStorage(id);
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 200));
  return tasks;
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED',
  comments?: string,
  updatedBy: 'supervisor' | 'lecturer' = 'supervisor'
): Promise<DailyTask | null> {
  const studentId = typeof window !== "undefined" ? localStorage.getItem('userEmail') || 'unknown_student' : 'unknown_student';
  const allTasks = getTasksFromStorage(studentId);
  
  const taskIndex = allTasks.findIndex(t => t.id === taskId);

  if (taskIndex > -1) {
    allTasks[taskIndex].status = newStatus;
    if (updatedBy === 'supervisor') {
        allTasks[taskIndex].supervisorComments = comments;
    } else {
        allTasks[taskIndex].lecturerComments = comments;
    }
    setTasksInStorage(studentId, allTasks);
    await new Promise(resolve => setTimeout(resolve, 200));
    return allTasks[taskIndex];
  }

  return null;
}

export async function getTaskById(taskId: string): Promise<DailyTask | null> {
    // Note: This is inefficient for a large number of students.
    // In a real app, you'd fetch this from the backend.
    // For localStorage, we need to guess the studentId or have it passed.
    const studentId = typeof window !== "undefined" ? localStorage.getItem('userEmail') || 'unknown_student' : 'unknown_student';
    const tasks = getTasksFromStorage(studentId);
    const foundTask = tasks.find(task => task.id === taskId) || null;
    await new Promise(resolve => setTimeout(resolve, 100));
    return foundTask;
}

// Mock function for supervisor/lecturer to fetch tasks for a specific student
export async function getTasksByStudentId(studentId: string): Promise<DailyTask[]> {
  const tasks = getTasksFromStorage(studentId);
  await new Promise(resolve => setTimeout(resolve, 200));
  return tasks;
}
