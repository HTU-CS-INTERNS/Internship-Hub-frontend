
'use client';

import type { InternshipDetails, HODApprovalQueueItem } from '@/types';
import { format } from 'date-fns';

const HOD_QUEUE_STORAGE_KEY = 'hodCompanyApprovalQueue_v2';
const STUDENT_INTERNSHIP_DETAILS_PREFIX = 'userInternshipDetails_'; // Assuming studentId is email for prototype

// --- Helper Functions for Mock Service ---

async function getQueue(): Promise<HODApprovalQueueItem[]> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
  const queueRaw = typeof window !== "undefined" ? localStorage.getItem(HOD_QUEUE_STORAGE_KEY) : null;
  return queueRaw ? JSON.parse(queueRaw) : [];
}

async function saveQueue(queue: HODApprovalQueueItem[]): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  if (typeof window !== "undefined") {
    localStorage.setItem(HOD_QUEUE_STORAGE_KEY, JSON.stringify(queue));
  }
}

async function getStudentInternshipDetails(studentId: string): Promise<InternshipDetails | null> {
  await new Promise(resolve => setTimeout(resolve, 150));
  const key = `${STUDENT_INTERNSHIP_DETAILS_PREFIX}${studentId}`;
  const detailsRaw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
  return detailsRaw ? JSON.parse(detailsRaw) : null;
}

async function saveStudentInternshipDetails(studentId: string, details: InternshipDetails): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const key = `${STUDENT_INTERNSHIP_DETAILS_PREFIX}${studentId}`;
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(details));
  }
}

// --- Exported Mock Service Functions ---

export async function submitPlacementForApproval(
  details: InternshipDetails, // This is the full details from the form
  studentId: string,
  studentName: string
): Promise<void> {
  const queue = await getQueue();
  
  // Remove any existing pending approval for this student to avoid duplicates
  const updatedQueue = queue.filter(item => !(item.studentId === studentId && item.status === 'PENDING_APPROVAL'));

  const newItem: HODApprovalQueueItem = {
    studentId: studentId,
    studentName: studentName,
    companyName: details.companyName,
    supervisorName: details.supervisorName,
    supervisorEmail: details.supervisorEmail,
    submissionDate: new Date().toISOString(),
    status: 'PENDING_APPROVAL',
  };
  updatedQueue.push(newItem);
  await saveQueue(updatedQueue);

  // Also save the full internship details for the student (as the form did previously)
  // The status is 'PENDING_APPROVAL'
  await saveStudentInternshipDetails(studentId, {
    ...details,
    status: 'PENDING_APPROVAL',
  });
}

export async function getPendingPlacements(): Promise<HODApprovalQueueItem[]> {
  const queue = await getQueue();
  return queue.filter(item => item.status === 'PENDING_APPROVAL');
}

export async function approvePlacement(studentId: string): Promise<void> {
  let queue = await getQueue();
  queue = queue.filter(item => !(item.studentId === studentId && item.status === 'PENDING_APPROVAL'));
  await saveQueue(queue);

  const details = await getStudentInternshipDetails(studentId);
  if (details) {
    details.status = 'APPROVED';
    details.hodComments = `Approved on ${format(new Date(), 'PPP')}`;
    details.rejectionReason = undefined;
    await saveStudentInternshipDetails(studentId, details);
  }
  // Simulate notifying supervisor - in real backend, this would send an email.
  console.log(`Mock Service: Placement approved for ${studentId}. Supervisor would be notified.`);
}

export async function rejectPlacement(studentId: string, reason: string): Promise<void> {
  let queue = await getQueue();
  queue = queue.filter(item => !(item.studentId === studentId && item.status === 'PENDING_APPROVAL'));
  await saveQueue(queue);

  const details = await getStudentInternshipDetails(studentId);
  if (details) {
    details.status = 'REJECTED';
    details.rejectionReason = reason;
    details.hodComments = `Rejected on ${format(new Date(), 'PPP')}. Reason: ${reason}`;
    await saveStudentInternshipDetails(studentId, details);
  }
   // Simulate notifying student
  console.log(`Mock Service: Placement rejected for ${studentId}. Reason: ${reason}. Student would be notified.`);
}
