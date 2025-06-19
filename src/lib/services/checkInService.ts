
'use client';

import type { CheckIn } from '@/types'; // Assuming CheckIn type matches schema
import { formatISO } from 'date-fns';

const CHECKINS_STORAGE_KEY = 'internshipTrack_checkIns_v1';

const getCurrentStudentId = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem('userEmail') || 'unknown_student';
  }
  return 'unknown_student';
};

async function getAllCheckInsFromStorage(): Promise<CheckIn[]> {
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async
  if (typeof window === "undefined") return [];
  const checkInsRaw = localStorage.getItem(CHECKINS_STORAGE_KEY);
  return checkInsRaw ? JSON.parse(checkInsRaw) : [];
}

async function saveAllCheckInsToStorage(checkIns: CheckIn[]): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async
  if (typeof window === "undefined") return;
  localStorage.setItem(CHECKINS_STORAGE_KEY, JSON.stringify(checkIns));
}


type CheckInCreatePayload = Omit<CheckIn, 'id' | 'student_id' | 'check_in_timestamp' | 'created_at' | 'supervisor_verification_status' | 'supervisor_comments'> & {
  photo_url?: string; // This will be the data URI or placeholder name from the form for mock
};


// Student: Create a new check-in
export const createCheckInForStudent = async (
  checkInData: CheckInCreatePayload
): Promise<CheckIn> => {
  const allCheckIns = await getAllCheckInsFromStorage();
  const studentId = getCurrentStudentId();
  const now = new Date();

  const newCheckIn: CheckIn = {
    id: `checkin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    student_id: studentId,
    check_in_timestamp: formatISO(now),
    created_at: formatISO(now),
    latitude: checkInData.latitude,
    longitude: checkInData.longitude,
    address_resolved: checkInData.address_resolved,
    manual_reason: checkInData.manual_reason,
    is_gps_verified: checkInData.is_gps_verified,
    is_outside_geofence: checkInData.is_outside_geofence,
    photo_url: checkInData.photo_url, // This is the data URI or placeholder name
    supervisor_verification_status: 'PENDING',
  };

  allCheckIns.push(newCheckIn);
  await saveAllCheckInsToStorage(allCheckIns);
  return newCheckIn;
};

// Student: Get their check-in history
export const getCheckInsByStudentId = async (studentId: string): Promise<CheckIn[]> => {
  const allCheckIns = await getAllCheckInsFromStorage();
  return allCheckIns
    .filter(checkIn => checkIn.student_id === studentId)
    .sort((a, b) => new Date(b.check_in_timestamp).getTime() - new Date(a.check_in_timestamp).getTime());
};

// Supervisor: Get check-ins for their assigned interns (status PENDING)
export const getCheckInsForSupervisorReview = async (supervisorId: string): Promise<CheckIn[]> => {
  // In a real app, this would fetch student_ids assigned to this supervisor from a join table
  // For mock, let's assume supervisorId 'supervisor_user_email' is assigned to 'student_user_email' (from getCurrentStudentId)
  const assignedStudentId = getCurrentStudentId(); // This is a placeholder logic
  
  const allCheckIns = await getAllCheckInsFromStorage();
  return allCheckIns
    .filter(checkIn => 
      checkIn.student_id === assignedStudentId && // Mock: supervisor sees the current "logged-in" student's checkins
      checkIn.supervisor_verification_status === 'PENDING'
    )
    .sort((a, b) => new Date(a.check_in_timestamp).getTime() - new Date(b.check_in_timestamp).getTime()); // Show oldest pending first
};

// Supervisor: Update check-in status (VERIFIED or FLAGGED)
export const updateCheckInStatusBySupervisor = async (
  checkInId: string,
  supervisorId: string, 
  newStatus: 'VERIFIED' | 'FLAGGED',
  comments?: string
): Promise<CheckIn | null> => {
  const allCheckIns = await getAllCheckInsFromStorage();
  const checkInIndex = allCheckIns.findIndex(ci => ci.id === checkInId);

  if (checkInIndex === -1) {
    console.error(`Check-in with ID ${checkInId} not found.`);
    return null;
  }
  
  // TODO: Add RLS or server-side check to ensure supervisorId is actually assigned to checkInToUpdate.student_id
  // For mock, assuming direct update.

  allCheckIns[checkInIndex].supervisor_verification_status = newStatus;
  allCheckIns[checkInIndex].supervisor_comments = comments || undefined;
  
  await saveAllCheckInsToStorage(allCheckIns);
  return allCheckIns[checkInIndex];
};

// Initialize with some dummy check-ins if needed for demonstration
export async function initializeDefaultCheckInsIfNeeded() {
  if (typeof window !== "undefined") {
    const checkInsRaw = localStorage.getItem(CHECKINS_STORAGE_KEY);
    if (!checkInsRaw || JSON.parse(checkInsRaw).length === 0) {
      const studentId = getCurrentStudentId();
      const defaultCheckIns: CheckIn[] = [
        { 
          id: 'chk1_default', 
          student_id: studentId, 
          check_in_timestamp: formatISO(new Date(new Date().setDate(new Date().getDate() -1))), 
          created_at: formatISO(new Date(new Date().setDate(new Date().getDate() -1))),
          latitude: 34.0522, longitude: -118.2437, 
          address_resolved: "123 Main St, Anytown (GPS)",
          is_gps_verified: true, 
          is_outside_geofence: false,
          supervisor_verification_status: 'VERIFIED',
          supervisor_comments: "Good check-in."
        },
        { 
          id: 'chk2_default', 
          student_id: studentId, 
          check_in_timestamp: formatISO(new Date()), 
          created_at: formatISO(new Date()),
          manual_reason: "Working from client site today.",
          is_gps_verified: false, 
          is_outside_geofence: false, // N/A for manual reason usually
          supervisor_verification_status: 'PENDING'
        },
      ];
      await saveAllCheckInsToStorage(defaultCheckIns);
      console.log("Initialized default check-ins for student:", studentId);
    }
  }
}
