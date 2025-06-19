
import { Request, Response } from 'express';
import * as placementService from '../services/placementService';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';
import type { InternshipDetails } from '../../../src/types';

// Student submits their placement details
export const submitPlacement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ message: 'User not authenticated' });

    const placementDetails = req.body as Omit<InternshipDetails, 'status' | 'rejectionReason' | 'hodComments'>;
    // Add validation for placementDetails here (e.g., using Zod)

    const { data, error } = await placementService.createOrUpdatePlacement(studentId, placementDetails);
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error submitting placement:', error);
    res.status(500).json({ message: 'Failed to submit placement', error: error.message });
  }
};

// Student gets their placement details
export const getStudentPlacement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ message: 'User not authenticated' });

    const { data, error } = await placementService.getPlacementByStudentId(studentId);
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'No placement details found for this student.' });
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching student placement:', error);
    res.status(500).json({ message: 'Failed to fetch placement details', error: error.message });
  }
};

// HOD gets pending placements for their department
export const getPendingPlacementsForHOD = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const hodId = req.user?.id;
    if (!hodId) return res.status(401).json({ message: 'User not authenticated' });

    // The service will need to determine the HOD's department
    const { data, error } = await placementService.getPendingPlacementsByHodDepartment(hodId);
    if (error) throw error;
    res.status(200).json(data || []);
  } catch (error: any) {
    console.error('Error fetching pending placements for HOD:', error);
    res.status(500).json({ message: 'Failed to fetch pending placements', error: error.message });
  }
};

// HOD approves a placement
export const approvePlacementByHOD = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const hodId = req.user?.id;
    const placementId = req.params.placementId; // This should be the ID of the internship_placements record
    const { hodComments } = req.body;

    if (!hodId) return res.status(401).json({ message: 'User not authenticated' });
    
    const { data, error } = await placementService.updatePlacementStatus(placementId, 'APPROVED', hodId, { hodComments });
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Placement not found or update failed (e.g., access denied, wrong current status).' });
    
    // TODO: Trigger supervisor invitation email if auto-invite is enabled
    // For now, just log: console.log(`Placement ${placementId} approved. Supervisor: ${data.company_supervisor_email} should be invited.`);

    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error approving placement:', error);
    if (error.message.includes('denied') || error.message.includes('not allowed')) return res.status(403).json({ message: error.message });
    res.status(500).json({ message: 'Failed to approve placement', error: error.message });
  }
};

// HOD rejects a placement
export const rejectPlacementByHOD = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const hodId = req.user?.id;
    const placementId = req.params.placementId;
    const { rejectionReason, hodComments } = req.body;

    if (!hodId) return res.status(401).json({ message: 'User not authenticated' });
    if (!rejectionReason) return res.status(400).json({ message: 'Rejection reason is required.' });

    const { data, error } = await placementService.updatePlacementStatus(placementId, 'REJECTED', hodId, { rejectionReason, hodComments });
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Placement not found or update failed.' });

    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error rejecting placement:', error);
     if (error.message.includes('denied') || error.message.includes('not allowed')) return res.status(403).json({ message: error.message });
    res.status(500).json({ message: 'Failed to reject placement', error: error.message });
  }
};
