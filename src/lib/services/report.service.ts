
'use client'; 

import type { DailyReport, AttachmentData } from '@/types';

// Use a consistent key for localStorage
const REPORTS_STORAGE_KEY_PREFIX = 'internshipHub_reports_';

function getStorageKey(studentId: string): string {
    return `${REPORTS_STORAGE_KEY_PREFIX}${studentId}`;
}

// Function to safely get data from localStorage
const getReportsFromStorage = (studentId: string): DailyReport[] => {
  if (typeof window === "undefined") return [];
  const key = getStorageKey(studentId);
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse reports from localStorage", e);
      return [];
    }
  }
  return [];
};

// Function to safely set data to localStorage
const setReportsInStorage = (studentId: string, reports: DailyReport[]): void => {
  if (typeof window === "undefined") return;
  const key = getStorageKey(studentId);
  try {
    localStorage.setItem(key, JSON.stringify(reports));
  } catch(e) {
    console.error("Failed to save reports to localStorage", e);
  }
};


export async function createReport(
  reportData: Omit<DailyReport, 'id' | 'studentId' | 'status'> & { attachments?: AttachmentData[]; securePhotoUrl?: string; }
): Promise<DailyReport> {
  const studentId = typeof window !== "undefined" ? localStorage.getItem('userEmail') || 'unknown_student' : 'unknown_student';
  const allReports = getReportsFromStorage(studentId);
  
  const newReport: DailyReport = {
    ...reportData,
    id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    studentId,
    status: 'SUBMITTED', // Default status on creation
  };

  allReports.unshift(newReport); // Add to the beginning of the list
  setReportsInStorage(studentId, allReports);
  
  await new Promise(resolve => setTimeout(resolve, 300));
  return newReport;
}

// This function now gets reports for the currently logged-in student (or a specified one)
export async function getReportsForStudent(studentId?: string): Promise<DailyReport[]> {
  const id = studentId || (typeof window !== "undefined" ? localStorage.getItem('userEmail') || 'unknown_student' : 'unknown_student');
  const reports = getReportsFromStorage(id);
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 200));
  return reports;
}

export async function updateReport(
    reportId: string, 
    updateData: Partial<Omit<DailyReport, 'id' | 'studentId'>>
): Promise<DailyReport | null> {
    const studentId = typeof window !== "undefined" ? localStorage.getItem('userEmail') || 'unknown_student' : 'unknown_student';
    const allReports = getReportsFromStorage(studentId);
    
    const reportIndex = allReports.findIndex(r => r.id === reportId);
    
    if (reportIndex > -1) {
        // Merge existing data with new data
        const updatedReport = { ...allReports[reportIndex], ...updateData };
        allReports[reportIndex] = updatedReport;
        setReportsInStorage(studentId, allReports);
        await new Promise(resolve => setTimeout(resolve, 200));
        return updatedReport;
    }
    
    return null; // Report not found
}


export async function updateReportStatus(
  reportId: string,
  newStatus: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED',
  comments?: string,
  updatedBy: 'supervisor' | 'lecturer' = 'supervisor' // Default to supervisor for backward compatibility
): Promise<DailyReport | null> {
  // To update a report, we need to know the student. For this mock, we assume
  // this is called by a lecturer/supervisor who has the student's context.
  // We'll search through all students' reports to find the right one. This is inefficient but works for a demo.
  if (typeof window === "undefined") return null;

  let found = false;
  let updatedReport: DailyReport | null = null;
  
  // This logic is flawed for a real app but works for a single-user demo
  const studentId = localStorage.getItem('userEmail') || 'unknown_student'; 
  const allReports = getReportsFromStorage(studentId);
  const reportIndex = allReports.findIndex(r => r.id === reportId);

  if (reportIndex > -1) {
    allReports[reportIndex].status = newStatus;
    if (updatedBy === 'supervisor') {
        allReports[reportIndex].supervisorComments = comments;
    } else {
        allReports[reportIndex].lecturerComments = comments;
    }
    setReportsInStorage(studentId, allReports);
    found = true;
    updatedReport = allReports[reportIndex];
  }


  await new Promise(resolve => setTimeout(resolve, 200));
  return updatedReport;
}

export async function getReportById(reportId: string): Promise<DailyReport | null> {
    // This is also inefficient but necessary for a localStorage-based mock.
    // In a real app, you'd fetch by ID directly.
    if (typeof window === "undefined") return null;
    let foundReport: DailyReport | null = null;
    
    // Check current user's reports first
    const studentId = localStorage.getItem('userEmail') || 'unknown_student';
    const reports = getReportsFromStorage(studentId);
    foundReport = reports.find(report => report.id === reportId) || null;

    if (foundReport) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return foundReport;
    }
    
    // If not found, iterate through all possible storage keys (not scalable)
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(REPORTS_STORAGE_KEY_PREFIX)) {
            const reports = JSON.parse(localStorage.getItem(key) || '[]') as DailyReport[];
            const report = reports.find(r => r.id === reportId);
            if (report) {
                foundReport = report;
                break;
            }
        }
    }

    await new Promise(resolve => setTimeout(resolve, 100));
    return foundReport;
}

// Mock function for supervisor/lecturer to fetch reports for a specific student
export async function getReportsByStudentId(studentId: string): Promise<DailyReport[]> {
  const reports = getReportsFromStorage(studentId);
  await new Promise(resolve => setTimeout(resolve, 200));
  return reports;
}

