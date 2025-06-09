
import { supabase } from '../config/supabaseClient';
import type { DailyReport, UserRole } from '../../../src/types'; // Adjust path if necessary

type ReportCreatePayload = Omit<DailyReport, 'id' | 'student_id' | 'status' | 'created_at' | 'updated_at' | 'submitted_at' | 'approved_by_supervisor_at' | 'approved_by_lecturer_at' | 'supervisor_comments' | 'lecturer_comments'> & { attachments?: File[] | string[] };

// Student: Create a new report
export const createReportForStudent = async (
  studentId: string,
  reportData: ReportCreatePayload
): Promise<{ data: DailyReport | null; error: any }> => {
  const newReportPayload = {
    ...reportData,
    student_id: studentId,
    status: 'PENDING' as DailyReport['status'],
    report_date: reportData.date, // Ensure field name matches schema
    submitted_at: new Date().toISOString(),
    // Attachment handling: Assume reportData.attachments are file names or will be processed to URLs by controller/another service before this
    attachments: reportData.attachments, // This should be an array of URLs or file paths in DB
  };
  delete (newReportPayload as any).date; // Remove original 'date' if it was just for the form

  const { data, error } = await supabase
    .from('reports')
    .insert(newReportPayload)
    .select()
    .single();
  return { data: data as DailyReport | null, error };
};

// Student: Get all their reports
export const getReportsByStudentId = async (studentId: string): Promise<{ data: DailyReport[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('student_id', studentId)
    .order('report_date', { ascending: false });
  return { data: data as DailyReport[] | null, error };
};

// Get a specific report by its ID and verify access
export const getReportByIdAndVerifyAccess = async (reportId: string, userId: string, userRole: UserRole): Promise<{ data: DailyReport | null; error: any }> => {
  const { data: report, error } = await supabase
    .from('reports')
    .select('*, student:users(id, name, email)') // Example join
    .eq('id', reportId)
    .single();

  if (error) return { data: null, error };
  if (!report) return { data: null, error: { message: 'Report not found' } };

  // Access Control Logic
  if (userRole === 'STUDENT' && report.student_id !== userId) {
    return { data: null, error: { message: 'Access denied: Student can only view their own reports.' } };
  }
  // For LECTURER, SUPERVISOR, HOD: Implement logic to check if they are assigned to this student
  // This requires joining with assignment tables or checking student's department/faculty for HOD.
  // RLS in Supabase should ideally enforce this.
  if (userRole === 'LECTURER' || userRole === 'SUPERVISOR' || userRole === 'HOD') {
    // Placeholder: Real check needed
    // e.g., const {data: assignment} = await supabase.from('student_lecturer_assignments').select().eq('student_id', report.student_id).eq('lecturer_id', userId).single();
    // if (!assignment && userRole === 'LECTURER') return { data: null, error: { message: 'Access denied.' }};
  }

  return { data: report as DailyReport | null, error: null };
};

// Student: Update their own report (if PENDING)
export const updateReportByStudent = async (
  reportId: string,
  studentId: string,
  updates: Partial<ReportCreatePayload> & { attachments?: File[] | string[] }
): Promise<{ data: DailyReport | null; error: any }> => {
  const { data: existingReport, error: fetchError } = await supabase
    .from('reports')
    .select('status, student_id')
    .eq('id', reportId)
    .single();

  if (fetchError || !existingReport) {
    return { data: null, error: fetchError || { message: 'Report not found for update' } };
  }
  if (existingReport.student_id !== studentId) {
    return { data: null, error: { message: 'Access denied: Cannot update report not owned by you.' } };
  }
  if (existingReport.status !== 'PENDING') {
    return { data: null, error: { message: 'Report cannot be updated as it is not in PENDING status.' } };
  }

  const updatePayload = { ...updates, updated_at: new Date().toISOString() } as any;
  if (updates.attachments) {
    // Assume conversion to URLs/paths happens before this service call or in controller
    updatePayload.attachments = updates.attachments;
  }
  if (updates.date) { // If form sends 'date' but table uses 'report_date'
    updatePayload.report_date = updates.date;
    delete updatePayload.date;
  }

  const { data, error } = await supabase
    .from('reports')
    .update(updatePayload)
    .eq('id', reportId)
    .select()
    .single();
  return { data: data as DailyReport | null, error };
};

// Student: Delete their own report (if PENDING)
export const deleteReportByStudent = async (reportId: string, studentId: string): Promise<{ data: { id: string } | null; error: any }> => {
   const { data: existingReport, error: fetchError } = await supabase
    .from('reports')
    .select('status, student_id')
    .eq('id', reportId)
    .single();

  if (fetchError || !existingReport) {
    return { data: null, error: fetchError || { message: 'Report not found for deletion' } };
  }
  if (existingReport.student_id !== studentId) {
    return { data: null, error: { message: 'Access denied: Cannot delete report not owned by you.' } };
  }
  if (existingReport.status !== 'PENDING') {
    return { data: null, error: { message: 'Report cannot be deleted as it is not in PENDING status.' } };
  }

  const { error } = await supabase.from('reports').delete().eq('id', reportId);
  return { data: error ? null : { id: reportId }, error };
};

// Reviewer (Lecturer/Supervisor/HOD): Get reports for their assigned students
export const getReportsForReviewer = async (reviewerId: string, reviewerRole: UserRole): Promise<{ data: DailyReport[] | null; error: any }> => {
  let query = supabase.from('reports').select('*, student:users (id, name, email)');

  if (reviewerRole === 'LECTURER') {
    const { data: assignments, error: assignmentError } = await supabase
        .from('student_lecturer_assignments')
        .select('student_id')
        .eq('lecturer_id', reviewerId)
        .eq('is_active', true);
    if (assignmentError) return { data: null, error: assignmentError };
    const studentIds = assignments?.map(a => a.student_id) || [];
    if (studentIds.length === 0) return { data: [], error: null };
    query = query.in('student_id', studentIds);
  } else if (reviewerRole === 'SUPERVISOR') {
    // Assuming supervisors are linked via student_supervisor_assignments
    const { data: assignments, error: assignmentError } = await supabase
        .from('student_supervisor_assignments')
        .select('student_id')
        .eq('supervisor_id', reviewerId)
        .eq('is_active', true);
    if (assignmentError) return { data: null, error: assignmentError };
    const studentIds = assignments?.map(a => a.student_id) || [];
    if (studentIds.length === 0) return { data: [], error: null };
    query = query.in('student_id', studentIds);
  } else if (reviewerRole === 'HOD') {
    const {data: hodProfile, error: hodError} = await supabase.from('users').select('department_id').eq('id', reviewerId).single();
    if (hodError || !hodProfile?.department_id) return { data: null, error: hodError || {message: "HOD department not found"} };
    const { data: studentsInDept, error: studentsError } = await supabase
        .from('users')
        .select('id')
        .eq('department_id', hodProfile.department_id)
        .eq('role', 'STUDENT');
    if (studentsError) return { data: null, error: studentsError };
    const studentIds = studentsInDept?.map(s => s.id) || [];
     if (studentIds.length === 0) return { data: [], error: null };
    query = query.in('student_id', studentIds);
  }

  const { data, error } = await query.order('report_date', { ascending: false });
  return { data: data as DailyReport[] | null, error };
};

// Reviewer (Lecturer/Supervisor/HOD): Update report status and add comments
export const updateReportStatusByReviewer = async (
  reportId: string,
  reviewerId: string,
  reviewerRole: UserRole,
  newStatus: 'APPROVED' | 'REJECTED',
  comments?: string
): Promise<{ data: DailyReport | null; error: any }> => {
  const { data: report, error: fetchError } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (fetchError || !report) {
    return { data: null, error: fetchError || { message: 'Report not found for status update.' } };
  }
  // TODO: Add access control: ensure reviewer is allowed to review this student's report.

  if (report.status !== 'SUBMITTED' && report.status !== 'PENDING') { 
     return { data: null, error: { message: `Cannot update status of report already in ${report.status} state.`} };
  }

  const updates: Partial<DailyReport> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  } as Partial<DailyReport>;

  if (reviewerRole === 'LECTURER' || reviewerRole === 'HOD') {
    updates.lecturer_comments = comments;
    if (newStatus === 'APPROVED') updates.approved_by_lecturer_at = new Date().toISOString();
  } else if (reviewerRole === 'SUPERVISOR') {
    updates.supervisor_comments = comments;
    if (newStatus === 'APPROVED') updates.approved_by_supervisor_at = new Date().toISOString();
  }

  const { data: updatedReport, error: updateError } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', reportId)
    .select()
    .single();
  
  return { data: updatedReport as DailyReport | null, error: updateError };
};
