
'use client';

import type { CheckIn } from '@/types';
import { formatISO } from 'date-fns';
import { apiClient } from '../api-client';

export type CheckInCreatePayload = Omit<CheckIn, 'id' | 'student_id' | 'check_in_timestamp' | 'created_at' | 'supervisor_verification_status' | 'supervisor_comments'> & {
  photo_url?: string; // This will be the data URI or placeholder name from the form
};

// Student: Create a new check-in
export const createCheckInForStudent = async (
  checkInData: CheckInCreatePayload
): Promise<CheckIn> => {
  try {
    const now = new Date();
    const payload = {
      check_in_timestamp: formatISO(now),
      latitude: checkInData.latitude,
      longitude: checkInData.longitude,
      address_resolved: checkInData.address_resolved,
      manual_reason: checkInData.manual_reason,
      is_gps_verified: checkInData.is_gps_verified,
      is_outside_geofence: checkInData.is_outside_geofence,
      photo_url: checkInData.photo_url,
    };

    // For check-ins, we might need to implement this endpoint in the backend
    // For now, we'll use a generic request
    const response = await apiClient.request<any>('api/check-ins', {
      method: 'POST',
      body: payload,
    });

    return {
      id: response.id.toString(),
      student_id: response.student_id?.toString() || '',
      check_in_timestamp: response.check_in_timestamp,
      created_at: response.created_at,
      latitude: response.latitude,
      longitude: response.longitude,
      address_resolved: response.address_resolved,
      manual_reason: response.manual_reason,
      is_gps_verified: response.is_gps_verified,
      is_outside_geofence: response.is_outside_geofence,
      photo_url: response.photo_url,
      supervisor_verification_status: response.supervisor_verification_status || 'PENDING',
      supervisor_comments: response.supervisor_comments,
    };
  } catch (error) {
    console.error('Error creating check-in:', error);
    throw error;
  }
};

// Student: Get their check-in history
export const getCheckInsByStudentId = async (studentId: string): Promise<CheckIn[]> => {
  try {
    const response = await apiClient.request<any[]>(`api/check-ins?student_id=${studentId}`);
    
    return response.map((checkIn: any) => ({
      id: checkIn.id.toString(),
      student_id: checkIn.student_id?.toString() || '',
      check_in_timestamp: checkIn.check_in_timestamp,
      created_at: checkIn.created_at,
      latitude: checkIn.latitude,
      longitude: checkIn.longitude,
      address_resolved: checkIn.address_resolved,
      manual_reason: checkIn.manual_reason,
      is_gps_verified: checkIn.is_gps_verified,
      is_outside_geofence: checkIn.is_outside_geofence,
      photo_url: checkIn.photo_url,
      supervisor_verification_status: checkIn.supervisor_verification_status || 'PENDING',
      supervisor_comments: checkIn.supervisor_comments,
    })).sort((a, b) => new Date(b.check_in_timestamp).getTime() - new Date(a.check_in_timestamp).getTime());
  } catch (error) {
    console.error('Error fetching check-ins for student:', error);
    return [];
  }
};

// Supervisor: Get check-ins for their assigned interns (status PENDING)
export const getCheckInsForSupervisorReview = async (supervisorId: string): Promise<CheckIn[]> => {
  try {
    const response = await apiClient.request<any[]>(`api/check-ins?status=PENDING&supervisor_id=${supervisorId}`);
    
    return response.map((checkIn: any) => ({
      id: checkIn.id.toString(),
      student_id: checkIn.student_id?.toString() || '',
      check_in_timestamp: checkIn.check_in_timestamp,
      created_at: checkIn.created_at,
      latitude: checkIn.latitude,
      longitude: checkIn.longitude,
      address_resolved: checkIn.address_resolved,
      manual_reason: checkIn.manual_reason,
      is_gps_verified: checkIn.is_gps_verified,
      is_outside_geofence: checkIn.is_outside_geofence,
      photo_url: checkIn.photo_url,
      supervisor_verification_status: checkIn.supervisor_verification_status || 'PENDING',
      supervisor_comments: checkIn.supervisor_comments,
    })).sort((a, b) => new Date(a.check_in_timestamp).getTime() - new Date(b.check_in_timestamp).getTime());
  } catch (error) {
    console.error('Error fetching check-ins for supervisor review:', error);
    return [];
  }
};

// Supervisor: Update check-in status (VERIFIED or FLAGGED)
export const updateCheckInStatusBySupervisor = async (
  checkInId: string,
  supervisorId: string, 
  newStatus: 'VERIFIED' | 'FLAGGED',
  comments?: string
): Promise<CheckIn | null> => {
  try {
    const response = await apiClient.request<any>(`api/check-ins/${checkInId}`, {
      method: 'PUT',
      body: {
        supervisor_verification_status: newStatus,
        supervisor_comments: comments,
      },
    });

    return {
      id: response.id.toString(),
      student_id: response.student_id?.toString() || '',
      check_in_timestamp: response.check_in_timestamp,
      created_at: response.created_at,
      latitude: response.latitude,
      longitude: response.longitude,
      address_resolved: response.address_resolved,
      manual_reason: response.manual_reason,
      is_gps_verified: response.is_gps_verified,
      is_outside_geofence: response.is_outside_geofence,
      photo_url: response.photo_url,
      supervisor_verification_status: response.supervisor_verification_status,
      supervisor_comments: response.supervisor_comments,
    };
  } catch (error) {
    console.error('Error updating check-in status:', error);
    return null;
  }
};
