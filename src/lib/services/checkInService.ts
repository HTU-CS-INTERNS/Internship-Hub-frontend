
'use client';

import type { CheckIn } from '@/types';
import { formatISO } from 'date-fns';

const CHECKINS_STORAGE_KEY_PREFIX = 'internshipHub_checkins_';

function getStorageKey(studentId: string): string {
    return `${CHECKINS_STORAGE_KEY_PREFIX}${studentId}`;
}

const getCheckInsFromStorage = (studentId: string): CheckIn[] => {
  if (typeof window === "undefined") return [];
  const key = getStorageKey(studentId);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setCheckInsInStorage = (studentId: string, checkins: CheckIn[]): void => {
  if (typeof window === "undefined") return;
  const key = getStorageKey(studentId);
  localStorage.setItem(key, JSON.stringify(checkins));
};


export type CheckInCreatePayload = Omit<CheckIn, 'id' | 'student_id' | 'check_in_timestamp' | 'created_at' | 'supervisor_verification_status' | 'supervisor_comments'> & {
  photo_url?: string;
};

// Student: Create a new check-in
export const createCheckInForStudent = async (
  checkInData: CheckInCreatePayload
): Promise<CheckIn> => {
  const studentId = typeof window !== "undefined" ? localStorage.getItem('userEmail') || 'unknown_student' : 'unknown_student';
  const allCheckins = getCheckInsFromStorage(studentId);
  const now = new Date();
  
  const newCheckIn: CheckIn = {
    id: `checkin_${Date.now()}`,
    student_id: studentId,
    check_in_timestamp: formatISO(now),
    created_at: formatISO(now),
    supervisor_verification_status: 'PENDING',
    ...checkInData
  };

  allCheckins.unshift(newCheckIn); // Add to the top
  setCheckInsInStorage(studentId, allCheckins);
  
  await new Promise(resolve => setTimeout(resolve, 300));
  return newCheckIn;
};

// Student: Get their check-in history
export const getCheckInsByStudentId = async (studentId: string): Promise<CheckIn[]> => {
  const checkins = getCheckInsFromStorage(studentId);
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  return checkins.sort((a, b) => new Date(b.check_in_timestamp).getTime() - new Date(a.check_in_timestamp).getTime());
};

// Supervisor: Get check-ins for their assigned interns (status PENDING)
export const getCheckInsForSupervisorReview = async (supervisorId: string): Promise<CheckIn[]> => {
  // This is a complex mock. For now, we return all check-ins for demo purposes.
  // In a real app, this would be a backend query.
  const allCheckins: CheckIn[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CHECKINS_STORAGE_KEY_PREFIX)) {
      const studentCheckins = JSON.parse(localStorage.getItem(key) || '[]');
      allCheckins.push(...studentCheckins);
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return allCheckins.filter(c => c.supervisor_verification_status === 'PENDING')
                    .sort((a, b) => new Date(a.check_in_timestamp).getTime() - new Date(b.check_in_timestamp).getTime());
};

// Supervisor: Update check-in status (VERIFIED or FLAGGED)
export const updateCheckInStatusBySupervisor = async (
  checkInId: string,
  newStatus: 'VERIFIED' | 'FLAGGED',
  comments?: string
): Promise<CheckIn | null> => {
  if (typeof window === "undefined") return null;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CHECKINS_STORAGE_KEY_PREFIX)) {
      let studentCheckins: CheckIn[] = JSON.parse(localStorage.getItem(key) || '[]');
      const checkInIndex = studentCheckins.findIndex(c => c.id === checkInId);
      if (checkInIndex > -1) {
        studentCheckins[checkInIndex].supervisor_verification_status = newStatus;
        studentCheckins[checkInIndex].supervisor_comments = comments;
        localStorage.setItem(key, JSON.stringify(studentCheckins));
        await new Promise(resolve => setTimeout(resolve, 100));
        return studentCheckins[checkInIndex];
      }
    }
  }
  return null;
};
