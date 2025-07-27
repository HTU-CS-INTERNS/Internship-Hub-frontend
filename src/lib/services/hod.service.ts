
'use client';

import type { InternshipDetails, HODApprovalQueueItem } from '@/types';

const HOD_APPROVAL_QUEUE_KEY = 'hodCompanyApprovalQueue';

// Function to safely get data from localStorage
const getPlacementsFromStorage = (): HODApprovalQueueItem[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(HOD_APPROVAL_QUEUE_KEY);
  return data ? JSON.parse(data) : [];
};

// Function to safely set data to localStorage
const setPlacementsInStorage = (placements: HODApprovalQueueItem[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(HOD_APPROVAL_QUEUE_KEY, JSON.stringify(placements));
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
    // Since approval is removed, we mark it as approved immediately.
    // The "HODApprovalQueue" now acts as a log of all placements.
    status: 'APPROVED' as any, // Cast to allow storing approved status
    startDate: details.startDate,
    endDate: details.endDate,
  };

  const allPlacements = getPlacementsFromStorage();
  
  // To prevent duplicates, we can update if an entry for the student already exists
  const existingIndex = allPlacements.findIndex(p => p.studentId === studentId);
  if (existingIndex > -1) {
    allPlacements[existingIndex] = newPlacement;
  } else {
    allPlacements.push(newPlacement);
  }
  
  setPlacementsInStorage(allPlacements);
  
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 300));
}

// This function now returns all placements, as there's no "pending" state.
export async function getPendingPlacements(): Promise<HODApprovalQueueItem[]> {
  const allPlacements = getPlacementsFromStorage();
  // Filter for items that *would have been* pending for consistency if needed elsewhere,
  // but now this concept is removed. We return everything.
  return allPlacements;
}

// The approvePlacement and rejectPlacement functions are no longer needed
// as the process is now automatic. They are kept here but are effectively no-ops.

export async function approvePlacement(studentId: string): Promise<void> {
  console.warn("approvePlacement is deprecated. Placements are now auto-approved.");
  // No action needed
}

export async function rejectPlacement(studentId: string, reason: string): Promise<void> {
  console.warn("rejectPlacement is deprecated. Placements are now auto-approved.");
  // No action needed
}

// Expose the getter for other parts of the app that need to display placement data.
export { getPlacementsFromStorage };
