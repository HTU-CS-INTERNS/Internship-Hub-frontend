
'use client';

import type { InternshipDetails, HODApprovalQueueItem } from '@/types';
import { format } from 'date-fns';
import { apiClient } from '../api-client';

export async function submitPlacementForApproval(
  details: InternshipDetails,
  studentId: string,
  studentName: string
): Promise<void> {
  try {
    const payload = {
      company_name: details.companyName,
      supervisor_name: details.supervisorName,
      supervisor_email: details.supervisorEmail,
      start_date: details.startDate,
      end_date: details.endDate,
      location: details.location,
      status: 'PENDING_APPROVAL',
    };

    await apiClient.createInternship(payload);
  } catch (error) {
    console.error('Error submitting placement for approval:', error);
    throw error;
  }
}

export async function getPendingPlacements(): Promise<HODApprovalQueueItem[]> {
  try {
    const response = await apiClient.getInternships();
    
    // Filter for pending placements and map to HODApprovalQueueItem format
    return response
      .filter((internship: any) => internship.status === 'PENDING_APPROVAL')
      .map((internship: any) => ({
        studentId: internship.student_id?.toString() || '',
        studentName: `${internship.students?.users?.first_name || ''} ${internship.students?.users?.last_name || ''}`.trim(),
        companyName: internship.companies?.name || '',
        supervisorName: internship.company_supervisors?.users?.first_name 
          ? `${internship.company_supervisors.users.first_name} ${internship.company_supervisors.users.last_name}`.trim()
          : '',
        supervisorEmail: internship.company_supervisors?.users?.email || '',
        submissionDate: internship.created_at || new Date().toISOString(),
        status: 'PENDING_APPROVAL' as const,
      }));
  } catch (error) {
    console.error('Error fetching pending placements:', error);
    return [];
  }
}

export async function approvePlacement(studentId: string): Promise<void> {
  try {
    // First, find the internship for this student
    const internships = await apiClient.getInternships();
    const internship = internships.find((i: any) => 
      i.student_id?.toString() === studentId && i.status === 'PENDING_APPROVAL'
    );

    if (!internship) {
      throw new Error('Internship not found for approval');
    }

    await apiClient.request(`api/internships/${internship.id}`, {
      method: 'PUT',
      body: {
        status: 'APPROVED',
        hod_comments: `Approved on ${format(new Date(), 'PPP')}`,
        approval_date: new Date().toISOString(),
      },
    });

    console.log(`Placement approved for student ${studentId}. Supervisor would be notified.`);
  } catch (error) {
    console.error('Error approving placement:', error);
    throw error;
  }
}

export async function rejectPlacement(studentId: string, reason: string): Promise<void> {
  try {
    // First, find the internship for this student
    const internships = await apiClient.getInternships();
    const internship = internships.find((i: any) => 
      i.student_id?.toString() === studentId && i.status === 'PENDING_APPROVAL'
    );

    if (!internship) {
      throw new Error('Internship not found for rejection');
    }

    await apiClient.request(`api/internships/${internship.id}`, {
      method: 'PUT',
      body: {
        status: 'REJECTED',
        rejection_reason: reason,
        hod_comments: `Rejected on ${format(new Date(), 'PPP')}: ${reason}`,
      },
    });

    console.log(`Placement rejected for student ${studentId}. Student would be notified.`);
  } catch (error) {
    console.error('Error rejecting placement:', error);
    throw error;
  }
}
