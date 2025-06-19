
import { Request, Response } from 'express';
import * as checkInService from '../services/checkInService';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';
import type { UserRole } from '../../../src/types';

// Student creates a check-in
export const createCheckIn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const { latitude, longitude, address_resolved, manual_reason, photo_url, is_gps_verified, is_outside_geofence } = req.body;

    // Basic validation
    if (is_gps_verified && (!latitude || !longitude)) {
      return res.status(400).json({ message: 'Latitude and longitude are required for GPS verified check-ins.' });
    }
    if (!is_gps_verified && !manual_reason && !photo_url) {
      return res.status(400).json({ message: 'Manual reason or photo URL is required for non-GPS check-ins.' });
    }

    const checkInData = { latitude, longitude, address_resolved, manual_reason, photo_url, is_gps_verified, is_outside_geofence };
    const { data: checkIn, error } = await checkInService.createCheckInForStudent(studentId, checkInData);

    if (error) throw error;
    res.status(201).json(checkIn);
  } catch (error: any) {
    console.error('Error creating check-in:', error);
    res.status(500).json({ message: 'Failed to create check-in', error: error.message });
  }
};

// Student gets their check-in history
export const getStudentCheckIns = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const { data: checkIns, error } = await checkInService.getCheckInsByStudentId(studentId);
    if (error) throw error;
    res.status(200).json(checkIns || []);
  } catch (error: any) {
    console.error('Error fetching student check-ins:', error);
    res.status(500).json({ message: 'Failed to fetch check-ins', error: error.message });
  }
};

// Supervisor gets check-ins for their assigned interns
export const getCheckInsForSupervisor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const supervisorId = req.user?.id;
    if (!supervisorId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    // This service function will need to find interns assigned to this supervisor
    const { data: checkIns, error } = await checkInService.getCheckInsForSupervisorReview(supervisorId);
    if (error) throw error;
    res.status(200).json(checkIns || []);
  } catch (error: any) {
    console.error('Error fetching check-ins for supervisor:', error);
    res.status(500).json({ message: 'Failed to fetch check-ins for supervisor', error: error.message });
  }
};

// Supervisor verifies or flags a check-in
export const verifyCheckInBySupervisor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const supervisorId = req.user?.id;
    const checkInId = req.params.checkInId;
    const { status, comments } = req.body as { status: 'VERIFIED' | 'FLAGGED', comments?: string };

    if (!supervisorId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    if (!status || !['VERIFIED', 'FLAGGED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided. Must be VERIFIED or FLAGGED.' });
    }

    const { data: updatedCheckIn, error } = await checkInService.updateCheckInStatusBySupervisor(checkInId, supervisorId, status, comments);

    if (error) throw error;
    if (!updatedCheckIn) return res.status(404).json({ message: 'Check-in not found or update failed (e.g., access denied).' });
    
    res.status(200).json(updatedCheckIn);
  } catch (error: any) {
    console.error('Error verifying check-in:', error);
    if (error.message.includes('denied')) return res.status(403).json({ message: error.message });
    res.status(500).json({ message: 'Failed to verify check-in', error: error.message });
  }
};
