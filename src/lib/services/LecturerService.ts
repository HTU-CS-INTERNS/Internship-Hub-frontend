import { apiClient } from '@/lib/supabase-api-client';
import { BaseService } from './BaseService';

/**
 * Lecturer Service - Academic lecturer operations  
 * Handles student supervision, internship approval, and academic oversight
 */
export class LecturerService extends BaseService {

  // Student Management
  static async getMyStudents() {
    try {
      const students = await apiClient.getStudents();
      return this.handleSuccess(students || []);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Internship Oversight
  static async getStudentInternships() {
    try {
      const internships = await apiClient.getInternships();
      return this.handleSuccess(internships || []);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async approveInternshipApplication(internshipId: number, approvalData: {
    lecturer_notes?: string;
    approved: boolean;
  }) {
    try {
      const updateData = {
        status: approvalData.approved ? 'APPROVED' as const : 'REJECTED' as const,
        lecturer_notes: approvalData.lecturer_notes,
        lecturer_approved_at: new Date().toISOString()
      };

      const result = await apiClient.updateInternship(internshipId, updateData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Academic Assessment
  static async createAcademicAssessment(assessmentData: {
    internship_id: number;
    evaluation_type: 'MID_TERM' | 'FINAL';
    technical_skills_rating: number;
    communication_skills_rating: number;
    professionalism_rating: number;
    learning_ability_rating: number;
    overall_rating: number;
    additional_comments?: string;
  }) {
    try {
      const evaluationData = {
        internship_id: assessmentData.internship_id,
        evaluation_date: new Date().toISOString(),
        evaluation_type: assessmentData.evaluation_type,
        comments: assessmentData.additional_comments
      };

      const result = await apiClient.createEvaluation(evaluationData);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Dashboard Data
  static async getDashboardData() {
    try {
      const [students, internships, evaluations] = await Promise.all([
        this.getMyStudents(),
        this.getStudentInternships(),
        apiClient.getEvaluations()
      ]);

      const pendingInternships = internships.data?.filter((i: any) => i.status === 'PENDING') || [];
      const activeInternships = internships.data?.filter((i: any) => i.status === 'IN_PROGRESS') || [];

      const dashboardData = {
        overview: {
          totalStudents: students.data?.length || 0,
          totalInternships: internships.data?.length || 0,
          pendingApprovals: pendingInternships.length,
          activeInternships: activeInternships.length,
          evaluationsCount: evaluations?.length || 0
        },
        students: students.data || [],
        pendingInternships,
        recentEvaluations: evaluations?.slice(0, 5) || []
      };

      return this.handleSuccess(dashboardData);
    } catch (error) {
      return this.handleError(error);
    }
  }
}
