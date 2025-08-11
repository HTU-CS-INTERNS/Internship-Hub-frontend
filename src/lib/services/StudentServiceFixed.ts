/**
 * Student Service - Fixed Version
 * Handles student operations with correct types and proper error handling
 */

import { supabase } from '@/lib/supabase';
import { emailService } from '@/lib/services/EmailService';
import type { Database } from '@/types/database';
import { apiClient } from '../supabase-api-client';

type Tables = Database['public']['Tables'];

interface InternshipApplicationData {
  company_name: string;
  company_address: string;
  supervisor_name: string;
  supervisor_email: string;
  start_date: string;
  end_date: string;
  location: string;
}

interface DailyReportData {
  report_date: string;
  title: string;
  description: string;
  outcomes?: string;
  learning_objectives?: string;
  challenges_faced?: string;
}

interface DailyTaskData {
  task_date: string;
  description: string;
  expected_outcome?: string;
  learning_objective?: string;
}

export class StudentService {
  /**
   * Submit internship application with auto-supervisor creation
   */
  static async submitInternshipApplication(applicationData: InternshipApplicationData): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get student record with user data
      const { data: students, error: studentError } = await supabase
        .from('students')
        .select(`
          *,
          users(first_name, last_name, email)
        `)
        .eq('user_id', user.id)
        .single();

      if (studentError || !students) {
        return { success: false, error: 'Student record not found' };
      }

      // Create or get company
      let companyId: number;
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('name', applicationData.company_name)
        .single();

      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: applicationData.company_name,
            address: applicationData.company_address,
            contact_email: applicationData.supervisor_email
          })
          .select('id')
          .single();

        if (companyError || !newCompany) {
          return { success: false, error: 'Failed to create company record' };
        }
        companyId = newCompany.id;
      }

      // Create supervisor user account
      const { data: supervisorAuth, error: supervisorAuthError } = await supabase.auth.admin.createUser({
        email: applicationData.supervisor_email,
        password: 'TempPassword123!', // They'll reset this on first login
        email_confirm: false,
        user_metadata: {
          first_name: applicationData.supervisor_name.split(' ')[0],
          last_name: applicationData.supervisor_name.split(' ').slice(1).join(' '),
          role: 'SUPERVISOR'
        }
      });

      if (supervisorAuthError) {
        console.error('Error creating supervisor auth:', supervisorAuthError);
        return { success: false, error: 'Failed to create supervisor account' };
      }

      // Insert supervisor user record
      const { data: supervisorUser, error: supervisorUserError } = await supabase
        .from('users')
        .insert({
          id: supervisorAuth.user.id,
          email: applicationData.supervisor_email,
          role: 'SUPERVISOR',
          first_name: applicationData.supervisor_name.split(' ')[0],
          last_name: applicationData.supervisor_name.split(' ').slice(1).join(' '),
          is_active: false // Will be activated when they verify email
        })
        .select()
        .single();

      if (supervisorUserError) {
        console.error('Error creating supervisor user:', supervisorUserError);
        return { success: false, error: 'Failed to create supervisor user record' };
      }

      // Create company supervisor record
      const { data: companySupervisor, error: supervisorError } = await supabase
        .from('company_supervisors')
        .insert({
          user_id: supervisorAuth.user.id,
          company_id: companyId,
          job_title: 'Supervisor'
        })
        .select()
        .single();

      if (supervisorError) {
        return { success: false, error: 'Failed to create supervisor record' };
      }

      // Create internship record - student_id should be user_id (string), not student.id (number)
      const { data: internship, error: internshipError } = await supabase
        .from('internships')
        .insert({
          student_id: user.id, // This is the user_id string
          company_id: companyId,
          company_supervisor_id: companySupervisor.id,
          start_date: applicationData.start_date,
          end_date: applicationData.end_date,
          status: 'APPROVED'
        })
        .select()
        .single();

      if (internshipError) {
        return { success: false, error: 'Failed to create internship record' };
      }

      // Send verification email to supervisor
      const userData = (students as any).users || { first_name: '', last_name: '' };
      const studentName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Student';
      
      await emailService.sendSupervisorVerificationEmail(
        applicationData.supervisor_email,
        applicationData.supervisor_name,
        studentName,
        applicationData.company_name
      );

      return { success: true };
    } catch (error) {
      console.error('Error submitting internship application:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to submit application' 
      };
    }
  }

  /**
   * Submit daily report
   */
  static async submitDailyReport(reportData: DailyReportData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get student record
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!student) {
        return { success: false, error: 'Student record not found' };
      }

      // Get active internship
      const { data: internship } = await supabase
        .from('internships')
        .select('id')
        .eq('student_id', user.id)
        .eq('status', 'IN_PROGRESS')
        .single();

      if (!internship) {
        return { success: false, error: 'No active internship found' };
      }

      // Create daily report
      const { error: reportError } = await supabase
        .from('daily_reports')
        .insert({
          internship_id: internship.id,
          student_id: student.id, // This uses the student table ID (number)
          report_date: reportData.report_date,
          title: reportData.title,
          description: reportData.description,
          outcomes: reportData.outcomes,
          learning_objectives: reportData.learning_objectives,
          challenges_faced: reportData.challenges_faced,
          status: 'PENDING'
        });

      if (reportError) {
        return { success: false, error: 'Failed to submit report' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error submitting daily report:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to submit report' 
      };
    }
  }

  /**
   * Submit daily task
   */
  static async submitDailyTask(taskData: DailyTaskData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get student record
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!student) {
        return { success: false, error: 'Student record not found' };
      }

      // Get active internship
      const { data: internship } = await supabase
        .from('internships')
        .select('id')
        .eq('student_id', user.id)
        .eq('status', 'IN_PROGRESS')
        .single();

      if (!internship) {
        return { success: false, error: 'No active internship found' };
      }

      // Create daily task
      const { error: taskError } = await supabase
        .from('daily_tasks')
        .insert({
          internship_id: internship.id,
          student_id: student.id, // This uses the student table ID (number)
          task_date: taskData.task_date,
          description: taskData.description,
          expected_outcome: taskData.expected_outcome,
          learning_objective: taskData.learning_objective,
          status: 'PENDING'
        });

      if (taskError) {
        return { success: false, error: 'Failed to submit task' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error submitting daily task:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to submit task' 
      };
    }
  }

  static async getDashboardData() {
    return apiClient.getStudentDashboardData();
  }

  static async getReports() {
    return apiClient.getMyReports();
  }

  static async getTasks() {
    return apiClient.getMyTasks();
  }

  static async getStudentProfile() {
    return apiClient.getMyProfile();
  }

  static async getCompanyInfo() {
    return apiClient.getMyCompanyInfo();
  }

  static async getAttendanceRecords(startDate: string, endDate: string) {
    return apiClient.getAttendanceRecords(startDate, endDate);
  }

  static async getSkills() {
    return apiClient.getMySkills();
  }

  static async getMilestones() {
    return apiClient.getMyMilestones();
  }

  static async getActivityData(period: 'week' | 'month' | 'all') {
    return apiClient.getMyActivityData(period);
  }
}
