
'use client'; 

import type { DailyReport, AttachmentData } from '@/types';
import { format } from 'date-fns';

const REPORTS_STORAGE_KEY = 'internshipTrack_dailyReports_v2'; // Updated key for new structure

const getCurrentStudentId = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem('userEmail') || 'unknown_student';
  }
  return 'unknown_student';
};

async function getAllReportsFromStorage(): Promise<DailyReport[]> {
  await new Promise(resolve => setTimeout(resolve, 50)); 
  if (typeof window === "undefined") return [];
  const reportsRaw = localStorage.getItem(REPORTS_STORAGE_KEY);
  return reportsRaw ? JSON.parse(reportsRaw) : [];
}

async function saveAllReportsToStorage(reports: DailyReport[]): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 50)); 
  if (typeof window === "undefined") return;
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
}

export async function createReport(
  reportData: Omit<DailyReport, 'id' | 'studentId' | 'status' | 'date'> & { 
    date: string; // Expecting formatted string 'yyyy-MM-dd'
    attachments: AttachmentData[]; 
    securePhotoUrl?: string; // Data URI or undefined
  }
): Promise<DailyReport> {
  const allReports = await getAllReportsFromStorage();
  const studentId = getCurrentStudentId();
  const newReport: DailyReport = {
    id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    studentId,
    status: 'PENDING', 
    date: reportData.date,
    title: reportData.title,
    description: reportData.description,
    challengesFaced: reportData.challengesFaced,
    learningObjectives: reportData.learningObjectives,
    outcomes: reportData.outcomes,
    attachments: reportData.attachments, // Now expects AttachmentData[]
    securePhotoUrl: reportData.securePhotoUrl,
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
    updates: Partial<Omit<DailyReport, 'id' | 'studentId' | 'status' | 'date'>> & { 
      date?: string; 
      attachments?: AttachmentData[];
      securePhotoUrl?: string | null; // Allow null to clear
    }
): Promise<DailyReport | null> {
  const allReports = await getAllReportsFromStorage();
  const reportIndex = allReports.findIndex(r => r.id === reportId);
  if (reportIndex === -1) {
    return null;
  }
  
  const updatedReportData = { ...allReports[reportIndex] };

  if (updates.date) updatedReportData.date = updates.date; // Expecting formatted string
  if (updates.title !== undefined) updatedReportData.title = updates.title;
  if (updates.description !== undefined) updatedReportData.description = updates.description;
  if (updates.challengesFaced !== undefined) updatedReportData.challengesFaced = updates.challengesFaced;
  if (updates.learningObjectives !== undefined) updatedReportData.learningObjectives = updates.learningObjectives;
  if (updates.outcomes !== undefined) updatedReportData.outcomes = updates.outcomes;
  
  if (updates.attachments !== undefined) {
    updatedReportData.attachments = updates.attachments;
  }
  
  if (updates.securePhotoUrl !== undefined) { // Check for undefined to distinguish from null
    updatedReportData.securePhotoUrl = updates.securePhotoUrl === null ? undefined : updates.securePhotoUrl;
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
      (allReports[reportIndex] as any).lecturerComments = comments; 
    }
  }

  await saveAllReportsToStorage(allReports);
  return allReports[reportIndex];
}

export async function initializeDefaultReportsIfNeeded() {
  if (typeof window !== "undefined") {
    const reportsRaw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (!reportsRaw || JSON.parse(reportsRaw).length === 0) {
      const studentId = getCurrentStudentId();
      const sampleDataUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      const defaultReports: DailyReport[] = [
         { 
            id: 'report1_default', 
            date: format(new Date(new Date().setDate(new Date().getDate() - 3)), 'yyyy-MM-dd'), 
            title: 'Weekly Auth Module Summary',
            description: 'Weekly summary of authentication module progress. Focused on JWT implementation and secure endpoint testing. Reviewed security protocols and updated documentation.', 
            outcomes: 'Module 70% complete. Security review passed.', 
            learningObjectives: 'Advanced JWT, security best practices, technical documentation.', 
            studentId: studentId, 
            status: 'APPROVED',
            challengesFaced: "Minor issues with token refresh logic, resolved by adjusting expiration strategy.",
            attachments: [{ name: "auth_architecture.pdf", type: "application/pdf", size: 10240, dataUri: sampleDataUri }],
            securePhotoUrl: sampleDataUri,
            supervisorComments: "Good progress this week. Keep it up!"
          },
      ];
      await saveAllReportsToStorage(defaultReports);
      console.log("Initialized default reports for student:", studentId);
    }
  }
}
