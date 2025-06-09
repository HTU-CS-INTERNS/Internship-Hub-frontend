
import { supabase } from '../config/supabaseClient';
import type { DailyTask, UserRole } from '../../../src/types'; // Adjust path

// Helper function to get studentId from user object
const getStudentIdFromUser = (user: any): string | null => {
  return user?.id || null;
};

// Student: Create a new task
export const createTaskForStudent = async (
  studentId: string,
  taskData: Omit<DailyTask, 'id' | 'studentId' | 'status' | 'attachments' | 'supervisorComments' | 'lecturerComments'> & { attachments?: File[] }
): Promise<{ data: DailyTask | null; error: any }> => {
  const newTaskPayload = {
    ...taskData,
    student_id: studentId,
    status: 'PENDING' as DailyTask['status'],
    // Attachment handling: In a real app, you'd upload files to Supabase Storage
    // and store the path/URL. For this conceptual service, we'll just store names if provided.
    attachments: taskData.attachments?.map(file => file.name) || [],
  };

  const { data, error } = await supabase
    .from('tasks')
    .insert(newTaskPayload)
    .select()
    .single();
  return { data: data as DailyTask | null, error };
};

// Student: Get all their tasks
export const getTasksByStudentId = async (studentId: string): Promise<{ data: DailyTask[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('student_id', studentId)
    .order('task_date', { ascending: false });
  return { data: data as DailyTask[] | null, error };
};

// Get a specific task by its ID and verify access
export const getTaskByIdAndVerifyAccess = async (taskId: string, userId: string, userRole: UserRole): Promise<{ data: DailyTask | null; error: any }> => {
  const { data: task, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (error) return { data: null, error };
  if (!task) return { data: null, error: { message: 'Task not found' } };

  // Access Control Logic
  if (userRole === 'STUDENT' && task.student_id !== userId) {
    return { data: null, error: { message: 'Access denied: Student can only view their own tasks.' } };
  }
  if (userRole === 'LECTURER' || userRole === 'HOD') {
    // TODO: Check if student_id is assigned to this lecturer/HOD
    // This requires joining with student_lecturer_assignments or similar
    // For now, allowing if role is Lecturer/HOD - RLS in Supabase should enforce actual data visibility
  }
  if (userRole === 'SUPERVISOR') {
    // TODO: Check if student_id is assigned to this supervisor
    // This requires joining with student_supervisor_assignments
  }
  // Admin has access
  if (userRole === 'ADMIN') {
      // Admin can view any task
  }


  return { data: task as DailyTask | null, error: null };
};

// Student: Update their own task (if PENDING)
export const updateTaskByStudent = async (
  taskId: string,
  studentId: string,
  updates: Partial<Omit<DailyTask, 'id' | 'studentId' | 'status' | 'supervisorComments' | 'lecturerComments'>> & { attachments?: File[] }
): Promise<{ data: DailyTask | null; error: any }> => {
  const { data: existingTask, error: fetchError } = await supabase
    .from('tasks')
    .select('status, student_id')
    .eq('id', taskId)
    .single();

  if (fetchError || !existingTask) {
    return { data: null, error: fetchError || { message: 'Task not found for update' } };
  }
  if (existingTask.student_id !== studentId) {
    return { data: null, error: { message: 'Access denied: Cannot update task not owned by you.' } };
  }
  if (existingTask.status !== 'PENDING') {
    return { data: null, error: { message: 'Task cannot be updated as it is not in PENDING status.' } };
  }

  const updatePayload = { ...updates, updated_at: new Date().toISOString() } as any;
  if (updates.attachments) {
    updatePayload.attachments = updates.attachments.map(file => file.name);
  } else if (updates.attachments === null) { // Explicitly clear attachments
     updatePayload.attachments = [];
  }


  const { data, error } = await supabase
    .from('tasks')
    .update(updatePayload)
    .eq('id', taskId)
    .select()
    .single();
  return { data: data as DailyTask | null, error };
};

// Student: Delete their own task (if PENDING)
export const deleteTaskByStudent = async (taskId: string, studentId: string): Promise<{ data: { id: string } | null; error: any }> => {
   const { data: existingTask, error: fetchError } = await supabase
    .from('tasks')
    .select('status, student_id')
    .eq('id', taskId)
    .single();

  if (fetchError || !existingTask) {
    return { data: null, error: fetchError || { message: 'Task not found for deletion' } };
  }
  if (existingTask.student_id !== studentId) {
    return { data: null, error: { message: 'Access denied: Cannot delete task not owned by you.' } };
  }
  if (existingTask.status !== 'PENDING') {
    return { data: null, error: { message: 'Task cannot be deleted as it is not in PENDING status.' } };
  }

  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  return { data: error ? null : { id: taskId }, error };
};

// Lecturer/HOD: Get tasks for their assigned students
export const getTasksForLecturerOrHod = async (reviewerId: string, reviewerRole: UserRole): Promise<{ data: DailyTask[] | null; error: any }> => {
  // This is a complex query that depends on your student_lecturer_assignments table and HOD department logic
  // For demonstration, let's assume RLS handles data visibility correctly or we fetch all if Admin/HOD for a department.
  // This is a placeholder for a more specific query.
  // In a real scenario, you'd fetch student_ids associated with the lecturer/HOD's department.

  let query = supabase.from('tasks').select(`
    *,
    student:users (id, name, email)
  `);

  if (reviewerRole === 'LECTURER') {
    // Fetch student_ids assigned to this lecturer
    const { data: assignments, error: assignmentError } = await supabase
        .from('student_lecturer_assignments')
        .select('student_id')
        .eq('lecturer_id', reviewerId)
        .eq('is_active', true);

    if (assignmentError) return { data: null, error: assignmentError };
    const studentIds = assignments?.map(a => a.student_id) || [];
    if (studentIds.length === 0) return { data: [], error: null }; // No assigned students

    query = query.in('student_id', studentIds);
  } else if (reviewerRole === 'HOD') {
    // Fetch department_id for this HOD
    const {data: hodProfile, error: hodError} = await supabase.from('users').select('department_id').eq('id', reviewerId).single();
    if (hodError || !hodProfile?.department_id) return { data: null, error: hodError || {message: "HOD department not found"} };

    // Fetch students in that department
     const { data: studentsInDept, error: studentsError } = await supabase
        .from('users')
        .select('id')
        .eq('department_id', hodProfile.department_id)
        .eq('role', 'STUDENT');
    if (studentsError) return { data: null, error: studentsError };
    const studentIds = studentsInDept?.map(s => s.id) || [];
     if (studentIds.length === 0) return { data: [], error: null }; // No students in department

    query = query.in('student_id', studentIds);
  }

  const { data, error } = await query.order('task_date', { ascending: false });
  return { data: data as DailyTask[] | null, error };
};

// Reviewer (Lecturer/Supervisor/HOD): Update task status and add comments
export const updateTaskStatusByReviewer = async (
  taskId: string,
  reviewerId: string,
  reviewerRole: UserRole,
  newStatus: 'APPROVED' | 'REJECTED',
  comments?: string
): Promise<{ data: DailyTask | null; error: any }> => {
  const { data: task, error: fetchError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (fetchError || !task) {
    return { data: null, error: fetchError || { message: 'Task not found for status update.' } };
  }

  // Add access control logic here: ensure reviewer is allowed to review this student's task
  // e.g., check student_lecturer_assignments or student_supervisor_assignments
  // This is simplified for now; RLS and proper checks are crucial.
  if (task.status !== 'SUBMITTED' && task.status !== 'PENDING') { // Or only 'SUBMITTED' depending on flow
     return { data: null, error: { message: `Cannot update status of task already in ${task.status} state.`} };
  }


  const updates: Partial<DailyTask> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  } as Partial<DailyTask>;

  if (comments) {
    if (reviewerRole === 'LECTURER' || reviewerRole === 'HOD') {
      updates.lecturer_comments = comments;
    } else if (reviewerRole === 'SUPERVISOR') {
      updates.supervisor_comments = comments;
    }
  }

  const { data: updatedTask, error: updateError } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();
  
  return { data: updatedTask as DailyTask | null, error: updateError };
};

// Other task-related functions (e.g., for supervisors) can be added here.
