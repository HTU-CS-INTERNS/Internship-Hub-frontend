
import { supabase } from '../config/supabaseClient';
import type { CheckIn } from '../../../src/types'; // Assuming CheckIn type matches schema

type CheckInCreatePayload = Omit<CheckIn, 'id' | 'student_id' | 'check_in_timestamp' | 'created_at' | 'supervisor_verification_status' | 'supervisor_comments'>;

// Student: Create a new check-in
export const createCheckInForStudent = async (
  studentId: string,
  checkInData: CheckInCreatePayload
): Promise<{ data: CheckIn | null; error: any }> => {
  const newCheckInPayload = {
    ...checkInData,
    student_id: studentId,
    check_in_timestamp: new Date().toISOString(),
    supervisor_verification_status: 'PENDING' as CheckIn['supervisor_verification_status'],
  };

  const { data, error } = await supabase
    .from('check_ins')
    .insert(newCheckInPayload)
    .select()
    .single();
  return { data: data as CheckIn | null, error };
};

// Student: Get their check-in history
export const getCheckInsByStudentId = async (studentId: string): Promise<{ data: CheckIn[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('student_id', studentId)
    .order('check_in_timestamp', { ascending: false });
  return { data: data as CheckIn[] | null, error };
};

// Supervisor: Get check-ins for their assigned interns (status PENDING)
export const getCheckInsForSupervisorReview = async (supervisorId: string): Promise<{ data: CheckIn[] | null; error: any }> => {
  // 1. Get student_ids assigned to this supervisor
  const { data: assignments, error: assignmentError } = await supabase
    .from('student_supervisor_assignments') // Assuming this table links supervisors to students
    .select('student_id')
    .eq('supervisor_id', supervisorId)
    .eq('is_active', true);

  if (assignmentError) return { data: null, error: assignmentError };
  const studentIds = assignments?.map(a => a.student_id) || [];
  if (studentIds.length === 0) return { data: [], error: null }; // No assigned students

  // 2. Get check-ins for those students that are PENDING supervisor verification
  const { data, error } = await supabase
    .from('check_ins')
    .select('*, student:users(id, name, email)')
    .in('student_id', studentIds)
    .eq('supervisor_verification_status', 'PENDING')
    .order('check_in_timestamp', { ascending: true }); // Show oldest pending first

  return { data: data as CheckIn[] | null, error };
};

// Supervisor: Update check-in status (VERIFIED or FLAGGED)
export const updateCheckInStatusBySupervisor = async (
  checkInId: string,
  supervisorId: string, // For audit or RLS
  newStatus: 'VERIFIED' | 'FLAGGED',
  comments?: string
): Promise<{ data: CheckIn | null; error: any }> => {
  const { data: checkInToUpdate, error: fetchError } = await supabase
    .from('check_ins')
    .select('id, student_id')
    .eq('id', checkInId)
    .single();

  if (fetchError || !checkInToUpdate) {
    return { data: null, error: fetchError || { message: 'Check-in not found.' } };
  }

  // TODO: Add RLS or server-side check to ensure supervisorId is actually assigned to checkInToUpdate.student_id
  // For now, assuming direct update if record exists.

  const updatePayload: Partial<CheckIn> = {
    supervisor_verification_status: newStatus,
    supervisor_comments: comments || null, // Set to null if comments are empty
    // updated_at can be handled by a trigger or set here: updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('check_ins')
    .update(updatePayload)
    .eq('id', checkInId)
    .select()
    .single();
  
  return { data: data as CheckIn | null, error };
};
