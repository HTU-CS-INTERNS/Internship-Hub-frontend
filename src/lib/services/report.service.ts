
'use client'; // Assuming this service might be used client-side for localStorage

import type { DailyReport } from '@/types'; // Ensure DailyReport is correctly defined
import { format } from 'date-fns';

const REPORTS_STORAGE_KEY = 'internshipTrack_dailyReports_v1';

// Helper to get current studentId (assuming it's stored as email in localStorage)
const getCurrentStudentId = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem('userEmail') || 'unknown_student';
  }
  return 'unknown_student';
};

async function getAllReportsFromStorage(): Promise<DailyReport[]> {
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async
  if (typeof window === "undefined") return [];
  const reportsRaw = localStorage.getItem(REPORTS_STORAGE_KEY);
  return reportsRaw ? JSON.parse(reportsRaw) : [];
}

async function saveAllReportsToStorage(reports: DailyReport[]): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async
  if (typeof window === "undefined") return;
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
}

export async function createReport(
  reportData: Omit<DailyReport, 'id' | 'studentId' | 'status' | 'date' | 'attachments' | 'securePhotoUrl'> & { 
    date: Date; 
    attachments?: File[]; 
    securePhoto?: File;
    summary?: string; // For compatibility if form uses summary
    learnings?: string; // For compatibility if form uses learnings
  }
): Promise<DailyReport> {
  const allReports = await getAllReportsFromStorage();
  const studentId = getCurrentStudentId();
  const newReport: DailyReport = {
    id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    studentId,
    status: 'PENDING', // Initial status for a newly created report
    date: format(reportData.date, 'yyyy-MM-dd'),
    title: reportData.title,
    description: reportData.summary || reportData.description, // Use summary if provided
    challengesFaced: reportData.challengesFaced,
    learningObjectives: reportData.learnings || reportData.learningObjectives, // Use learnings if provided
    outcomes: reportData.outcomes,
    attachments: reportData.attachments?.map(file => file.name) || [],
    securePhotoUrl: reportData.securePhoto ? `uploads/secure_${reportData.securePhoto.name}` : undefined, // Simulate URL
  };
  allReports.push(newReport);
  await saveAllReportsToStorage(allReports);
  return newReport;
}

export async function getReportsByStudent(studentId: string): Promise<DailyReport[]> {
  const allReports = await getAllReportsFromStorage();
  return allReports.filter(report => report.studentId === studentId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getReportById(reportId: string): Promise<DailyReport | null> {
  const allReports = await getAllReportsFromStorage();
  const report = allReports.find(r => r.id === reportId) || null;
  return report;
}

export async function updateReport(
    reportId: string, 
    updates: Partial<Omit<DailyReport, 'id' | 'studentId' | 'status' | 'date' | 'attachments' | 'securePhotoUrl'>> & { 
      date?: Date; 
      attachments?: File[]; 
      securePhoto?: File;
      summary?: string; 
      learnings?: string; 
    }
): Promise<DailyReport | null> {
  const allReports = await getAllReportsFromStorage();
  const reportIndex = allReports.findIndex(r => r.id === reportId);
  if (reportIndex === -1) {
    return null;
  }
  
  const updatedReportData = { ...allReports[reportIndex] };

  if (updates.date) updatedReportData.date = format(updates.date, 'yyyy-MM-dd');
  if (updates.title !== undefined) updatedReportData.title = updates.title;
  if (updates.summary !== undefined) updatedReportData.description = updates.summary; // Map summary to description
  else if (updates.description !== undefined) updatedReportData.description = updates.description;
  if (updates.challengesFaced !== undefined) updatedReportData.challengesFaced = updates.challengesFaced;
  if (updates.learnings !== undefined) updatedReportData.learningObjectives = updates.learnings; // Map learnings to learningObjectives
  else if (updates.learningObjectives !== undefined) updatedReportData.learningObjectives = updates.learningObjectives;
  if (updates.outcomes !== undefined) updatedReportData.outcomes = updates.outcomes;
  
  if (updates.attachments && updates.attachments.length > 0) {
    updatedReportData.attachments = updates.attachments.map(file => file.name);
  } else if (updates.attachments === undefined && !allReports[reportIndex].attachments) {
     updatedReportData.attachments = [];
  }

  if (updates.securePhoto) {
    updatedReportData.securePhotoUrl = `uploads/secure_${updates.securePhoto.name}`; // Simulate URL
  } else if (updates.securePhoto === null) { // Explicitly clearing photo
    updatedReportData.securePhotoUrl = undefined;
  }

  allReports[reportIndex] = updatedReportData;
  await saveAllReportsToStorage(allReports);
  return allReports[reportIndex];
}

export async function updateReportStatus(
  reportId: string,
  newStatus: DailyReport['status'],
  comments?: string,
  commenterRole?: 'supervisor' | 'lecturer'
): Promise<DailyReport | null> {
  const allReports = await getAllReportsFromStorage();
  const reportIndex = allReports.findIndex(r => r.id === reportId);

  if (reportIndex === -1) {
    console.error(`Report with ID ${reportId} not found for status update.`);
    return null;
  }

  allReports[reportIndex].status = newStatus;
  if (comments) {
    if (commenterRole === 'supervisor') {
      allReports[reportIndex].supervisorComments = comments;
    } else if (commenterRole === 'lecturer') {
      // Assuming lecturerComments field exists on DailyReport if lecturers can comment
      (allReports[reportIndex] as any).lecturerComments = comments; 
    }
  }

  await saveAllReportsToStorage(allReports);
  return allReports[reportIndex];
}

// Optional: Initialize with DUMMY_REPORTS if needed for demo
// (Similar to task.service.ts, can be called from the reports page)
// initializeDefaultReportsIfNeeded();
