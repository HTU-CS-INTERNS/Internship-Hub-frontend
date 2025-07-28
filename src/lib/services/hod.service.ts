
'use client';

import type { InternshipDetails, HODApprovalQueueItem, UserProfileData } from '@/types';

const PLACEMENT_STORAGE_KEY = 'hodCompanyApprovalQueue';

// Function to safely get data from localStorage
const getPlacementsFromStorage = (): HODApprovalQueueItem[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(PLACEMENT_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Function to safely set data to localStorage
const setPlacementsInStorage = (placements: HODApprovalQueueItem[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(PLACEMENT_STORAGE_KEY, JSON.stringify(placements));
};

export async function savePlacement(
  details: InternshipDetails,
  studentId: string,
  studentName: string
): Promise<void> {
  const newPlacement: HODApprovalQueueItem = {
    studentId: studentId,
    studentName: studentName,
    companyName: details.companyName,
    supervisorName: details.supervisorName,
    supervisorEmail: details.supervisorEmail,
    submissionDate: new Date().toISOString(),
    status: 'APPROVED' as any,
    startDate: details.startDate,
    endDate: details.endDate,
    location: details.location,
  };

  const allPlacements = getPlacementsFromStorage();
  
  const existingIndex = allPlacements.findIndex(p => p.studentId === studentId);
  if (existingIndex > -1) {
    // Update existing placement
    allPlacements[existingIndex] = { ...allPlacements[existingIndex], ...newPlacement };
  } else {
    allPlacements.push(newPlacement);
  }
  
  setPlacementsInStorage(allPlacements);
  
  await new Promise(resolve => setTimeout(resolve, 300));
}


// This function now returns all placements, as there's no "pending" state.
export async function getPendingPlacements(): Promise<HODApprovalQueueItem[]> {
  const allPlacements = getPlacementsFromStorage();
  return allPlacements;
}

// The approvePlacement and rejectPlacement functions are no longer needed
// as the process is now automatic. They are kept here but are effectively no-ops.

export async function approvePlacement(studentId: string): Promise<void> {
  console.warn("approvePlacement is deprecated. Placements are now auto-approved.");
}

export async function rejectPlacement(studentId: string, reason: string): Promise<void> {
  console.warn("rejectPlacement is deprecated. Placements are now auto-approved.");
}

// Expose the getter for other parts of the app that need to display placement data.
export { getPlacementsFromStorage };
