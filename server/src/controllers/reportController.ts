
import { Request, Response } from 'express';
import * as reportService from '../services/reportService';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';
import type { UserRole } from '../../../src/types'; // Assuming types are shared

// Create a new report
export const createReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    // Basic validation (use a library like Zod for robust validation)
    const { date, title, description, challenges_faced, learning_objectives, outcomes, secure_photo_url, attachments } = req.body;
    if (!date || !description || !learning_objectives) {
      return res.status(400).json({ message: 'Missing required report fields' });
    }

    const reportData = { date, title, description, challenges_faced, learning_objectives, outcomes, secure_photo_url, attachments };
    const { data: report, error } = await reportService.createReportForStudent(studentId, reportData);

    if (error) throw error;
    res.status(201).json(report);
  } catch (error: any) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Failed to create report', error: error.message });
  }
};

// Get all reports for the logged-in student
export const getStudentReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const { data: reports, error } = await reportService.getReportsByStudentId(studentId);
    if (error) throw error;
    res.status(200).json(reports || []);
  } catch (error: any) {
    console.error('Error fetching student reports:', error);
    res.status(500).json({ message: 'Failed to fetch reports', error: error.message });
  }
};

// Get a specific report by ID
export const getReportById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reportId = req.params.reportId;
    const userId = req.user?.id;
    const userRole = req.user?.role as UserRole;

    if (!userId || !userRole) return res.status(401).json({ message: 'User not authenticated or role missing' });
    
    const { data: report, error } = await reportService.getReportByIdAndVerifyAccess(reportId, userId, userRole);
    if (error) throw error;
    if (!report) return res.status(404).json({ message: 'Report not found or access denied' });
    
    res.status(200).json(report);
  } catch (error: any) {
    console.error('Error fetching report by ID:', error);
    if (error.message.includes('denied')) return res.status(403).json({ message: error.message });
    res.status(500).json({ message: 'Failed to fetch report', error: error.message });
  }
};

// Update a report
export const updateReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reportId = req.params.reportId;
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ message: 'User not authenticated' });

    const updates = req.body; 
    const { data: report, error } = await reportService.updateReportByStudent(reportId, studentId, updates);

    if (error) throw error;
    if (!report) return res.status(404).json({ message: 'Report not found, not owned by user, or not in PENDING status.' });
    
    res.status(200).json(report);
  } catch (error: any) {
    console.error('Error updating report:', error);
     if (error.message.includes('denied') || error.message.includes('not allowed')) return res.status(403).json({ message: error.message });
    res.status(500).json({ message: 'Failed to update report', error: error.message });
  }
};

// Delete a report
export const deleteReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reportId = req.params.reportId;
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ message: 'User not authenticated' });

    const { data, error } = await reportService.deleteReportByStudent(reportId, studentId);
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Report not found, not owned by user, or not in PENDING status.' });

    res.status(204).send(); 
  } catch (error: any) {
    console.error('Error deleting report:', error);
    if (error.message.includes('denied') || error.message.includes('not allowed')) return res.status(403).json({ message: error.message });
    res.status(500).json({ message: 'Failed to delete report', error: error.message });
  }
};

// Get reports for students assigned to a lecturer/supervisor/HOD
export const getReportsForReviewer = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const reviewerId = req.user?.id;
        const reviewerRole = req.user?.role as UserRole;
        if (!reviewerId || !reviewerRole) {
            return res.status(401).json({ message: 'User not authenticated or role missing' });
        }
        const { data: reports, error } = await reportService.getReportsForReviewer(reviewerId, reviewerRole);
        if (error) throw error;
        res.status(200).json(reports || []);
    } catch (error: any) {
        console.error('Error fetching reports for reviewer:', error);
        res.status(500).json({ message: 'Failed to fetch reports for reviewer', error: error.message });
    }
};

// Update report status by reviewer (Lecturer/Supervisor/HOD)
export const updateReportStatusByReviewer = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const reportId = req.params.reportId;
        const reviewerId = req.user?.id;
        const reviewerRole = req.user?.role as UserRole; 
        const { status, comments } = req.body; 

        if (!reviewerId || !reviewerRole) {
            return res.status(401).json({ message: 'User not authenticated or role missing' });
        }
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }

        const { data: report, error } = await reportService.updateReportStatusByReviewer(reportId, reviewerId, reviewerRole, status, comments);

        if (error) throw error;
        if (!report) return res.status(404).json({ message: 'Report not found or update failed (e.g., access denied, wrong current status).' });
        
        res.status(200).json(report);
    } catch (error: any) {
        console.error('Error updating report status:', error);
        if (error.message.includes('denied') || error.message.includes('not allowed')) return res.status(403).json({ message: error.message });
        res.status(500).json({ message: 'Failed to update report status', error: error.message });
    }
};
