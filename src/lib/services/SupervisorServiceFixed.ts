/**
 * Supervisor Service - Fixed Version
 * Handles company supervisor operations with correct types
 */

import { supabase } from '@/lib/supabase';
import { emailService } from '@/lib/services/EmailService';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];

interface StudentSummary {
  id: number;
  user_id: string;
  name: string;
  email: string;
  status: string;
  internship_id: number;
  company_name: string;
  start_date: string;
  end_date: string;
  total_tasks: number;
  pending_tasks: number;
  total_reports: number;
  pending_reports: number;
}

interface TaskApprovalData {
  task_id: number;
  status: 'APPROVED' | 'REJECTED';
  feedback?: string;
}

export class SupervisorService {
  /**
   * Get students under supervision with proper type handling
   */
  async getMyStudents(supervisorUserId: string): Promise<{ success: boolean; data?: StudentSummary[]; error?: string }> {
    try {
      // Get supervisor record
      const { data: supervisors, error: supervisorError } = await supabase
        .from('company_supervisors')
        .select('*')
        .eq('user_id', supervisorUserId);

      if (supervisorError) throw supervisorError;
      if (!supervisors?.length) {
        return { success: false, error: 'Supervisor record not found' };
      }

      const supervisor = supervisors[0];

      // Get internships with related data
      const { data: internships, error: internshipsError } = await supabase
        .from('internships')
        .select(`
          *,
          companies(name),
          students!inner(
            id,
            user_id,
            status,
            users(first_name, last_name, email)
          )
        `)
        .eq('company_supervisor_id', supervisor.id);

      if (internshipsError) throw internshipsError;

      const studentsData: StudentSummary[] = [];

      for (const internship of internships || []) {
        const student = (internship as any).students;
        const users = (student as any).users;
        const company = (internship as any).companies;

        // Get task counts
        const { data: tasks } = await supabase
          .from('daily_tasks')
          .select('id, status')
          .eq('student_id', student.id);

        // Get report counts  
        const { data: reports } = await supabase
          .from('daily_reports')
          .select('id, status')
          .eq('student_id', student.id);

        studentsData.push({
          id: student.id,
          user_id: student.user_id,
          name: `${users?.first_name || ''} ${users?.last_name || ''}`.trim(),
          email: users?.email || '',
          status: student.status,
          internship_id: internship.id,
          company_name: company?.name || 'Unknown Company',
          start_date: internship.start_date,
          end_date: internship.end_date,
          total_tasks: tasks?.length || 0,
          pending_tasks: tasks?.filter(t => t.status === 'PENDING').length || 0,
          total_reports: reports?.length || 0,
          pending_reports: reports?.filter(r => r.status === 'PENDING').length || 0,
        });
      }

      return { success: true, data: studentsData };
    } catch (error) {
      console.error('Error fetching students:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch students' 
      };
    }
  }

  /**
   * Approve or reject a student task
   */
  async approveTask(approvalData: TaskApprovalData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('daily_tasks')
        .update({
          status: approvalData.status,
          supervisor_comments: approvalData.feedback || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', approvalData.task_id)
        .select(`
          *,
          students(
            user_id,
            users(email, first_name, last_name)
          )
        `)
        .single();

      if (error) throw error;

      // Send notification email to student
      const student = (data as any).students;
      const users = (student as any).users;
      
      if (users?.email) {
        await emailService.sendTaskApprovalNotification(
          users.email,
          `${users.first_name || ''} ${users.last_name || ''}`.trim(),
          approvalData.status,
          approvalData.feedback
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error approving task:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to approve task' 
      };
    }
  }

  /**
   * Get pending tasks for supervisor review
   */
  async getPendingTasks(supervisorUserId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      // Get supervisor
      const { data: supervisors } = await supabase
        .from('company_supervisors')
        .select('id')
        .eq('user_id', supervisorUserId);

      if (!supervisors?.length) {
        return { success: false, error: 'Supervisor not found' };
      }

      // Get pending tasks for supervised students
      const { data: tasks, error } = await supabase
        .from('daily_tasks')
        .select(`
          *,
          internships!inner(
            company_supervisor_id,
            students(
              users(first_name, last_name, email)
            )
          )
        `)
        .eq('status', 'PENDING')
        .eq('internships.company_supervisor_id', supervisors[0].id);

      if (error) throw error;

      return { success: true, data: tasks || [] };
    } catch (error) {
      console.error('Error fetching pending tasks:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch pending tasks' 
      };
    }
  }

  /**
   * Get pending reports for supervisor review
   */
  async getPendingReports(supervisorUserId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      // Get supervisor
      const { data: supervisors } = await supabase
        .from('company_supervisors')
        .select('id')
        .eq('user_id', supervisorUserId);

      if (!supervisors?.length) {
        return { success: false, error: 'Supervisor not found' };
      }

      // Get pending reports for supervised students
      const { data: reports, error } = await supabase
        .from('daily_reports')
        .select(`
          *,
          internships!inner(
            company_supervisor_id,
            students(
              users(first_name, last_name, email)
            )
          )
        `)
        .eq('status', 'PENDING')
        .eq('internships.company_supervisor_id', supervisors[0].id);

      if (error) throw error;

      return { success: true, data: reports || [] };
    } catch (error) {
      console.error('Error fetching pending reports:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch pending reports' 
      };
    }
  }

  /**
   * Approve or reject a student report
   */
  async approveReport(reportId: number, status: 'APPROVED' | 'REJECTED', feedback?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .update({
          status,
          supervisor_comments: feedback || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)
        .select(`
          *,
          students(
            users(email, first_name, last_name)
          )
        `)
        .single();

      if (error) throw error;

      // Send notification email to student
      const student = (data as any).students;
      const users = (student as any).users;
      
      if (users?.email) {
        await emailService.sendReportApprovalNotification(
          users.email,
          `${users.first_name || ''} ${users.last_name || ''}`.trim(),
          status,
          feedback
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error approving report:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to approve report' 
      };
    }
  }

  /**
   * Get supervisor dashboard stats
   */
  async getDashboardStats(supervisorUserId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Get supervisor
      const { data: supervisors } = await supabase
        .from('company_supervisors')
        .select('id')
        .eq('user_id', supervisorUserId);

      if (!supervisors?.length) {
        return { success: false, error: 'Supervisor not found' };
      }

      // Get students count
      const { data: internships } = await supabase
        .from('internships')
        .select('id')
        .eq('company_supervisor_id', supervisors[0].id);

      // Get pending tasks count
      const { data: pendingTasks } = await supabase
        .from('daily_tasks')
        .select('id')
        .eq('status', 'PENDING')
        .in('internship_id', internships?.map(i => i.id) || []);

      // Get pending reports count
      const { data: pendingReports } = await supabase
        .from('daily_reports')
        .select('id')
        .eq('status', 'PENDING')
        .in('internship_id', internships?.map(i => i.id) || []);

      return {
        success: true,
        data: {
          total_students: internships?.length || 0,
          pending_tasks: pendingTasks?.length || 0,
          pending_reports: pendingReports?.length || 0,
          active_internships: internships?.length || 0
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats' 
      };
    }
  }
}
