
import { supabase } from '../config/supabaseClient';
import type { Evaluation, EvaluationScore, UserRole } from '../../../src/types'; // Adjust paths as necessary
import { SCORING_METRICS } from '../../../src/lib/constants'; // Assuming constants are accessible

type EvaluationCreatePayload = Omit<Evaluation, 'id' | 'created_at' | 'updated_at' | 'scores'> & {
  scores: Record<string, number>; // e.g., { metric_key: score_value }
};

// Create or Update an Evaluation (simplified, might need more robust upsert logic)
export const createOrUpdateEvaluation = async (
  evaluationData: EvaluationCreatePayload
): Promise<{ data: Evaluation | null; error: any }> => {
  // Check if an evaluation by this evaluator for this student on this date already exists
  const { data: existingEval, error: fetchErr } = await supabase
    .from('evaluations')
    .select('id')
    .eq('student_id', evaluationData.student_id)
    .eq('evaluator_id', evaluationData.evaluator_id)
    .eq('evaluation_date', evaluationData.evaluation_date) // Dates need to be exact match for this logic
    .single();

  if (fetchErr && fetchErr.code !== 'PGRST116') { // PGRST116 means no rows found, which is OK for create
    console.error("Error checking for existing evaluation:", fetchErr);
    return { data: null, error: fetchErr };
  }
  
  const { scores, ...mainEvalData } = evaluationData;
  let evaluationId = existingEval?.id;

  // Transaction start
  try {
    // If evaluation exists, update it. Otherwise, insert a new one.
    if (evaluationId) {
      const { data: updatedEval, error: updateMainError } = await supabase
        .from('evaluations')
        .update({ ...mainEvalData, updated_at: new Date().toISOString() })
        .eq('id', evaluationId)
        .select()
        .single();
      if (updateMainError) throw updateMainError;
      // Delete old scores before inserting new ones for an update
      const { error: deleteScoresError } = await supabase
        .from('evaluation_scores')
        .delete()
        .eq('evaluation_id', evaluationId);
      if (deleteScoresError) throw deleteScoresError;
    } else {
      const { data: newEval, error: insertMainError } = await supabase
        .from('evaluations')
        .insert(mainEvalData)
        .select()
        .single();
      if (insertMainError) throw insertMainError;
      if (!newEval) throw new Error('Failed to create evaluation entry.');
      evaluationId = newEval.id;
    }

    // Prepare and insert/upsert scores
    const scoreEntries: Omit<EvaluationScore, 'id'>[] = [];
    for (const metricKey in scores) {
      const metric = SCORING_METRICS.find(m => m.id === metricKey); // Get label from constants
      if (metric) {
        scoreEntries.push({
          evaluation_id: evaluationId,
          metric_key: metricKey,
          score: scores[metricKey],
          metric_label: metric.label,
        });
      }
    }

    if (scoreEntries.length > 0) {
      const { error: scoresError } = await supabase
        .from('evaluation_scores')
        .insert(scoreEntries);
      if (scoresError) throw scoresError;
    }

    // Fetch the full evaluation with scores
    const { data: finalEvaluation, error: finalFetchError } = await supabase
      .from('evaluations')
      .select(`
        *,
        evaluation_scores (*)
      `)
      .eq('id', evaluationId)
      .single();
      
    if (finalFetchError) throw finalFetchError;
    return { data: finalEvaluation as Evaluation | null, error: null };

  } catch (error: any) {
    console.error("Error in createOrUpdateEvaluation transaction:", error);
    return { data: null, error };
  }
};

// Get a specific evaluation by ID, including its scores
export const getEvaluationById = async (evaluationId: string, userId: string, userRole: UserRole): Promise<{ data: Evaluation | null; error: any }> => {
  const { data, error } = await supabase
    .from('evaluations')
    .select(`
      *,
      student:users!evaluations_student_id_fkey(id, name, email),
      evaluator:users!evaluations_evaluator_id_fkey(id, name, email),
      evaluation_scores (*)
    `)
    .eq('id', evaluationId)
    .single();

  if (error) return { data: null, error };
  if (!data) return { data: null, error: { message: 'Evaluation not found.' } };
  
  // Access Control:
  // Student can see their own evaluation.
  // Evaluator (Lecturer/Supervisor) can see evaluations they made.
  // HOD/Admin can see based on broader scope (e.g., department/all) - RLS should handle this primarily.
  if (userRole === 'STUDENT' && data.student_id !== userId) {
    return { data: null, error: { message: 'Access denied: Student can only view their own evaluations.' } };
  }
  if ((userRole === 'LECTURER' || userRole === 'SUPERVISOR') && data.evaluator_id !== userId && data.student_id !== userId /* and student is not assigned to them */) {
     // More complex check: if evaluator is not the current user, they must be assigned to the student being evaluated.
     // This requires checking student_lecturer_assignments or student_supervisor_assignments.
     // For simplicity here, we assume RLS or a more specific controller check handles this.
     // If an evaluator is trying to view an eval they didn't make, but for a student they ARE assigned, that's valid.
     // For now, basic check:
    // if (data.evaluator_id !== userId) return { data: null, error: { message: 'Access denied: Cannot view evaluation not made by you, unless you supervise the student.'}};
  }

  return { data: data as Evaluation | null, error: null };
};

// Get all evaluations for a specific student
export const getEvaluationsForStudent = async (studentId: string, requestingUserId: string, requestingUserRole: UserRole): Promise<{ data: Evaluation[] | null; error: any }> => {
  // Student can view their own. Others require specific permissions (handled by RLS or controller)
  if (requestingUserRole === 'STUDENT' && studentId !== requestingUserId) {
     return { data: null, error: { message: 'Forbidden: Students can only view their own evaluations.' } };
  }
  
  // TODO: For LECTURER/SUPERVISOR/HOD, verify they have rights to see this student's evaluations.
  // This could involve checking student_lecturer_assignments, student_supervisor_assignments, or student's department for HOD.
  // RLS is the best place for fine-grained access control.

  const { data, error } = await supabase
    .from('evaluations')
    .select(`
      *,
      evaluator:users!evaluations_evaluator_id_fkey(id, name, role),
      evaluation_scores (*)
    `)
    .eq('student_id', studentId)
    .order('evaluation_date', { ascending: false });
  return { data: data as Evaluation[] | null, error };
};

// Get all evaluations made by a specific evaluator
export const getEvaluationsByEvaluator = async (evaluatorId: string, requestingUserRole: UserRole): Promise<{ data: Evaluation[] | null; error: any }> => {
  // Evaluator sees their own. HOD/Admin might see for their department/all.
  // RLS should handle this.
  const { data, error } = await supabase
    .from('evaluations')
    .select(`
      *,
      student:users!evaluations_student_id_fkey(id, name, email),
      evaluation_scores (*)
    `)
    .eq('evaluator_id', evaluatorId)
    .order('evaluation_date', { ascending: false });
  return { data: data as Evaluation[] | null, error };
};


// HOD/Admin: Get evaluations for a department (Conceptual, needs student-department link)
/*
export const getEvaluationsForDepartment = async (departmentId: string): Promise<{ data: Evaluation[] | null; error: any }> => {
  // 1. Get all students in the departmentId
  const { data: students, error: studentError } = await supabase
    .from('users')
    .select('id')
    .eq('department_id', departmentId)
    .eq('role', 'STUDENT');

  if (studentError) return { data: null, error: studentError };
  const studentIds = students.map(s => s.id);
  if (studentIds.length === 0) return { data: [], error: null };

  // 2. Get evaluations for these students
  const { data, error } = await supabase
    .from('evaluations')
    .select(`*, student:users(name), evaluator:users(name), evaluation_scores(*)`)
    .in('student_id', studentIds)
    .order('evaluation_date', { ascending: false });
  return { data: data as Evaluation[] | null, error };
};
*/
