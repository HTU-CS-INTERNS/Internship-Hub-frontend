
import { supabase } from '../config/supabaseClient';
import type { InternshipDetails, InternshipStatus } from '../../../src/types';

// Student submits or updates their placement details
export const createOrUpdatePlacement = async (
  studentId: string,
  details: Omit<InternshipDetails, 'status' | 'rejectionReason' | 'hodComments'>
): Promise<{ data: InternshipDetails | null; error: any }> => {
  const placementPayload = {
    student_id: studentId,
    company_name: details.companyName,
    company_address: details.companyAddress,
    company_supervisor_name: details.supervisorName,
    company_supervisor_email: details.supervisorEmail,
    start_date: details.startDate, // Ensure these are YYYY-MM-DD strings
    end_date: details.endDate,
    location_details: details.location,
    status: 'PENDING_APPROVAL' as InternshipStatus, // Default status on submission/update
    submitted_at: new Date().toISOString(),
    // Clear approval/rejection fields on new submission/update
    approved_at: null,
    rejection_reason: null,
    hod_comments: null,
  };

  // Upsert attempts to insert, or update if a conflict occurs (e.g., student_id unique constraint)
  const { data, error } = await supabase
    .from('internship_placements')
    .upsert(placementPayload, { onConflict: 'student_id' }) // Assumes student_id is unique key for a student's single active placement
    .select()
    .single();

  return { data: data as InternshipDetails | null, error };
};

// Get placement details for a specific student
export const getPlacementByStudentId = async (studentId: string): Promise<{ data: InternshipDetails | null; error: any }> => {
  const { data, error } = await supabase
    .from('internship_placements')
    .select('*')
    .eq('student_id', studentId)
    .maybeSingle(); // Use maybeSingle if a student might not have a placement yet

  return { data: data as InternshipDetails | null, error };
};

// HOD: Get pending placements for their department
export const getPendingPlacementsByHodDepartment = async (hodId: string): Promise<{ data: any[] | null; error: any }> => {
  // 1. Get HOD's department_id
  const { data: hodProfile, error: hodError } = await supabase
    .from('users')
    .select('department_id')
    .eq('id', hodId)
    .single();

  if (hodError || !hodProfile?.department_id) {
    return { data: null, error: hodError || { message: "HOD's department not found." } };
  }

  // 2. Get placements for students in that department with PENDING_APPROVAL status
  const { data, error } = await supabase
    .from('internship_placements')
    .select(`
      *,
      student:users (id, name, email, department_id, school_id)
    `)
    .eq('status', 'PENDING_APPROVAL')
    .filter('student.department_id', 'eq', hodProfile.department_id); // Filter by student's department

  return { data, error };
};

// HOD: Update placement status (Approve/Reject)
export const updatePlacementStatus = async (
  placementId: string,
  newStatus: 'APPROVED' | 'REJECTED',
  hodId: string, // For audit purposes or further checks
  updateData: { rejectionReason?: string; hodComments?: string }
): Promise<{ data: InternshipDetails | null; error: any }> => {
  const { data: placement, error: fetchError } = await supabase
    .from('internship_placements')
    .select('status, student_id, company_supervisor_email')
    .eq('id', placementId)
    .single();

  if (fetchError || !placement) {
    return { data: null, error: fetchError || { message: 'Placement not found.' } };
  }

  // Optional: Verify HOD has authority over this student's department
  // This check is complex and might be better handled by RLS or a dedicated function.
  // For now, we assume the HOD route protection handled department scope.

  if (placement.status !== 'PENDING_APPROVAL') {
    return { data: null, error: { message: `Placement is already in ${placement.status} status and cannot be updated.` } };
  }

  const payload: Partial<InternshipDetails> & { updated_at: string } = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };
  if (newStatus === 'APPROVED') {
    payload.approved_at = new Date().toISOString();
    payload.rejection_reason = null; // Clear any previous rejection reason
    if (updateData.hodComments) payload.hod_comments = updateData.hodComments;
  } else if (newStatus === 'REJECTED') {
    if (!updateData.rejectionReason) return { data: null, error: { message: 'Rejection reason is required.' } };
    payload.rejection_reason = updateData.rejectionReason;
    payload.approved_at = null;
    if (updateData.hodComments) payload.hod_comments = updateData.hodComments;
  }

  const { data: updatedPlacement, error: updateError } = await supabase
    .from('internship_placements')
    .update(payload)
    .eq('id', placementId)
    .select()
    .single();
  
  // Return the email for supervisor notification on approval
  return { data: { ...updatedPlacement, company_supervisor_email: placement.company_supervisor_email } as InternshipDetails | null, error: updateError };
};

// More functions can be added:
// - Admin fetching all placements with filters
// - Assigning lecturer to an approved placement
// - Linking supervisor user account to a placement
