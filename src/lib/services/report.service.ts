
'use client'; 

import type { DailyReport, AttachmentData } from '@/types';
import { format } from 'date-fns';
import { apiClient } from '../api-client';

export async function createReport(
  reportData: Omit<DailyReport, 'id' | 'studentId' | 'status' | 'date'> & { 
    date: string; // Expecting formatted string 'yyyy-MM-dd'
    attachments?: AttachmentData[]; 
    securePhotoUrl?: string; // Data URI or undefined
  }
): Promise<DailyReport> {
  try {
    // First, get the user's internship ID
    const internship = await apiClient.getMyInternship();
    if (!internship) {
      throw new Error('No active internship found for current user');
    }

    const payload = {
      report_date: reportData.date,
      summary_of_work: reportData.description,
      // Note: The backend schema doesn't have separate fields for title, challengesFaced, etc.
      // We'll need to format them into the summary_of_work field or extend the backend
    };

    const response = await apiClient.createDailyReport(internship.id, payload);
    
    // Map backend response to frontend format
    return {
      id: response.id.toString(),
      studentId: internship.student_id?.toString() || '',
      description: response.summary_of_work,
      date: response.report_date,
      status: response.status === 'pending_review' ? 'PENDING' : response.status?.toUpperCase() || 'PENDING',
      outcomes: '', // Backend doesn't have this field
      learningObjectives: '', // Backend doesn't have this field
      title: reportData.title,
      challengesFaced: reportData.challengesFaced,
      attachments: reportData.attachments || [],
      securePhotoUrl: reportData.securePhotoUrl,
    };
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
}

export async function getReportsForStudent(studentId?: string): Promise<DailyReport[]> {
  try {
    // Get the user's internship ID
    const internship = await apiClient.getMyInternship();
    if (!internship) {
      console.warn('No active internship found for current user');
      return [];
    }

    const response = await apiClient.getDailyReports(internship.id);
    
    // Map backend response to frontend format
    return response.map((report: any) => ({
      id: report.id.toString(),
      studentId: internship.student_id?.toString() || '',
      description: report.summary_of_work,
      date: report.report_date,
      status: report.status === 'pending_review' ? 'PENDING' : report.status?.toUpperCase() || 'PENDING',
      outcomes: '', // Backend doesn't have this field
      learningObjectives: '', // Backend doesn't have this field
      title: undefined, // Backend doesn't have this field
      challengesFaced: undefined, // Backend doesn't have this field
      attachments: [], // Backend uses report_attachments table
      securePhotoUrl: undefined, // Backend doesn't have this field
    }));
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
}

export async function updateReportStatus(
  reportId: string,
  status: 'PENDING' | 'APPROVED' | 'REJECTED',
  comments?: string
): Promise<void> {
  try {
    // Get the user's internship ID
    const internship = await apiClient.getMyInternship();
    if (!internship) {
      throw new Error('No active internship found for current user');
    }

    // Map frontend status to backend status
    const backendStatus = status === 'PENDING' ? 'pending_review' : status.toLowerCase();
    
    await apiClient.updateDailyReport(internship.id, parseInt(reportId), { 
      status: backendStatus,
      company_supervisor_feedback: comments 
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    throw error;
  }
}

export async function getReportById(reportId: string): Promise<DailyReport | null> {
  try {
    const reports = await getReportsForStudent();
    return reports.find(report => report.id === reportId) || null;
  } catch (error) {
    console.error('Error fetching report by ID:', error);
    return null;
  }
}

export async function getReportsForSupervisor(): Promise<DailyReport[]> {
  try {
    // For supervisors, we'll need to get reports from all their assigned internships
    // This might require a different endpoint or getting all internships first
    console.warn('getReportsForSupervisor not fully implemented - needs backend endpoint for supervisor reports');
    return [];
  } catch (error) {
    console.error('Error fetching reports for supervisor:', error);
    return [];
  }
}
