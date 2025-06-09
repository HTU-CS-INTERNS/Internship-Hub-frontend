
import { Request, Response } from 'express';
import * as evaluationService from '../services/evaluationService';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';
import type { UserRole } from '../../../src/types';

// Create or Update an evaluation for a student
export const createOrUpdateEvaluation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const evaluatorId = req.user?.id;
    const evaluatorRole = req.user?.role as UserRole;

    if (!evaluatorId || !evaluatorRole || (evaluatorRole !== 'LECTURER' && evaluatorRole !== 'SUPERVISOR')) {
      return res.status(403).json({ message: 'Forbidden: Only Lecturers or Supervisors can create/update evaluations.' });
    }

    const { student_id, evaluation_date, overall_comments, strengths, areas_for_improvement, scores } = req.body;
    
    if (!student_id || !evaluation_date || !overall_comments || !scores) {
      return res.status(400).json({ message: 'Missing required fields: student_id, evaluation_date, overall_comments, scores.' });
    }
    // TODO: Validate scores structure (e.g., each metric_key from a predefined list, score 1-5)

    const evaluationData = {
      student_id,
      evaluator_id: evaluatorId,
      evaluator_role: evaluatorRole,
      evaluation_date,
      overall_comments,
      strengths,
      areas_for_improvement,
      scores, // This will be an object like { metric_key1: score1, metric_key2: score2 }
    };

    // Upsert logic: if evaluation for this student by this evaluator on this date exists, update, else create.
    // Or, allow multiple evaluations and rely on distinct IDs. For simplicity, this might create new ones.
    // The service can implement more specific upsert or find-and-update logic.
    const { data: evaluation, error } = await evaluationService.createOrUpdateEvaluation(evaluationData);

    if (error) throw error;
    res.status(201).json(evaluation);
  } catch (error: any) {
    console.error('Error creating/updating evaluation:', error);
    if (error.message.includes('Constraint violation') || error.message.includes('unique constraint')) {
        return res.status(409).json({ message: 'An evaluation by you for this student on this date might already exist.', error: error.message });
    }
    res.status(500).json({ message: 'Failed to create/update evaluation', error: error.message });
  }
};

// Get a specific evaluation by its ID
export const getEvaluationById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const evaluationId = req.params.evaluationId;
    const userId = req.user?.id;
    const userRole = req.user?.role as UserRole;

    if (!userId || !userRole) return res.status(401).json({ message: 'User not authenticated or role missing' });

    const { data: evaluation, error } = await evaluationService.getEvaluationById(evaluationId, userId, userRole);
    if (error) throw error;
    if (!evaluation) return res.status(404).json({ message: 'Evaluation not found or access denied.' });
    
    res.status(200).json(evaluation);
  } catch (error: any) {
    console.error('Error fetching evaluation by ID:', error);
    if (error.message.includes('denied')) return res.status(403).json({ message: error.message });
    res.status(500).json({ message: 'Failed to fetch evaluation', error: error.message });
  }
};

// Get all evaluations for a specific student
export const getEvaluationsForStudent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentIdForEval = req.params.studentId;
    const requestingUserId = req.user?.id;
    const requestingUserRole = req.user?.role as UserRole;

    if (!requestingUserId || !requestingUserRole) return res.status(401).json({ message: 'User not authenticated' });

    // Access control: Student can see their own. Others need specific permissions.
    if (requestingUserRole === 'STUDENT' && studentIdForEval !== requestingUserId) {
        return res.status(403).json({ message: 'Forbidden: Students can only view their own evaluations.' });
    }
    
    const { data: evaluations, error } = await evaluationService.getEvaluationsForStudent(studentIdForEval, requestingUserId, requestingUserRole);
    if (error) throw error;
    res.status(200).json(evaluations || []);
  } catch (error: any)
{
    console.error('Error fetching evaluations for student:', error);
    if (error.message.includes('denied')) return res.status(403).json({ message: error.message });
    res.status(500).json({ message: 'Failed to fetch evaluations for student', error: error.message });
  }
};

// Get all evaluations made by a specific evaluator
export const getEvaluationsByEvaluator = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const evaluatorIdForEval = req.params.evaluatorId;
    const requestingUserId = req.user?.id;
    const requestingUserRole = req.user?.role as UserRole;

    if (!requestingUserId || !requestingUserRole) return res.status(401).json({ message: 'User not authenticated' });
    
    // Access control: Evaluators see their own. HOD/Admin might see more.
    if ((requestingUserRole === 'LECTURER' || requestingUserRole === 'SUPERVISOR') && evaluatorIdForEval !== requestingUserId) {
        return res.status(403).json({ message: 'Forbidden: You can only view evaluations made by you.' });
    }

    const { data: evaluations, error } = await evaluationService.getEvaluationsByEvaluator(evaluatorIdForEval, requestingUserRole);
    if (error) throw error;
    res.status(200).json(evaluations || []);
  } catch (error: any) {
    console.error('Error fetching evaluations by evaluator:', error);
    if (error.message.includes('denied')) return res.status(403).json({ message: error.message });
    res.status(500).json({ message: 'Failed to fetch evaluations by evaluator', error: error.message });
  }
};

// Placeholder for HOD/Admin fetching evaluations for a department
// export const getEvaluationsForDepartment = async (req: AuthenticatedRequest, res: Response) => { ... }
