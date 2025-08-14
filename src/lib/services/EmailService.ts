/**
 * Email Service for Internship Hub
 * Handles all email notifications for the system
 */

import { supabase } from '@/lib/supabase';

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  templateType: 'supervisor_verification' | 'task_notification' | 'report_notification' | 'evaluation_request';
  metadata?: Record<string, any>;
}

class EmailService {
  /**
   * Send supervisor verification email
   */
  async sendSupervisorVerificationEmail(
    supervisorEmail: string,
    supervisorName: string,
    studentName: string,
    companyName: string,
    verificationToken?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const verificationLink = verificationToken 
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/supervisor-verification?token=${verificationToken}&email=${encodeURIComponent(supervisorEmail)}`
        : `${process.env.NEXT_PUBLIC_SITE_URL}/supervisor-verification`;

      const emailTemplate = this.generateSupervisorVerificationTemplate(
        supervisorName,
        studentName,
        companyName,
        verificationLink
      );

      const emailData: EmailNotification = {
        to: supervisorEmail,
        subject: `Verify Your Supervisor Account - ${studentName} Internship`,
        html: emailTemplate,
        templateType: 'supervisor_verification',
        metadata: {
          supervisorName,
          studentName,
          companyName,
          verificationLink
        }
      };

      const { error } = await supabase.from('email_notifications').insert({
        recipient_email: emailData.to,
        subject: emailData.subject,
        html_content: emailData.html,
        template_type: emailData.templateType,
        metadata: emailData.metadata,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

      if (error) {
        console.error('Error storing email notification:', error);
        return { success: false, error: error.message };
      }
      
      console.log('📧 SUPERVISOR VERIFICATION EMAIL:', emailData);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending supervisor verification email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      };
    }
  }

  /**
   * Send task notification email
   */
  async sendTaskNotificationEmail(
    recipientEmail: string,
    recipientName: string,
    taskTitle: string,
    notificationType: 'submitted' | 'approved' | 'rejected',
    feedback?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const emailTemplate = this.generateTaskNotificationTemplate(
        recipientName,
        'A Student', // Generic to avoid needing student service
        taskTitle,
        notificationType,
        feedback
      );

      const emailData: EmailNotification = {
        to: recipientEmail,
        subject: `Task ${notificationType.charAt(0).toUpperCase() + notificationType.slice(1)} - ${taskTitle}`,
        html: emailTemplate,
        templateType: 'task_notification',
        metadata: {
          recipientName,
          taskTitle,
          notificationType,
          feedback
        }
      };

      const { error } = await supabase.from('email_notifications').insert({
        recipient_email: emailData.to,
        subject: emailData.subject,
        html_content: emailData.html,
        template_type: emailData.templateType,
        metadata: emailData.metadata,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

      if (error) {
        console.error('Error storing task notification:', error);
        return { success: false, error: error.message };
      }

      console.log('📧 TASK NOTIFICATION EMAIL:', emailData);
      return { success: true };
    } catch (error) {
      console.error('Error sending task notification:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send notification' 
      };
    }
  }

    /**
   * Send report notification email
   */
  async sendReportNotificationEmail(
    recipientEmail: string,
    recipientName: string,
    reportTitle: string,
    notificationType: 'submitted' | 'approved' | 'rejected',
    studentName?: string,
    feedback?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const emailTemplate = this.generateReportNotificationTemplate(
        recipientName,
        studentName || 'A student',
        reportTitle,
        notificationType,
        feedback
      );

      const emailData: EmailNotification = {
        to: recipientEmail,
        subject: `Report ${notificationType.charAt(0).toUpperCase() + notificationType.slice(1)} - ${reportTitle}`,
        html: emailTemplate,
        templateType: 'report_notification',
        metadata: {
          recipientName,
          studentName,
          reportTitle,
          notificationType,
          feedback
        }
      };
      
      const { error } = await supabase.from('email_notifications').insert({
        recipient_email: emailData.to,
        subject: emailData.subject,
        html_content: emailData.html,
        template_type: emailData.templateType,
        metadata: emailData.metadata,
        status: 'sent',
        sent_at: new Date().toISOString()
      });
      if (error) {
        console.error('Error storing report notification:', error);
        return { success: false, error: error.message };
      }
      console.log('📧 REPORT NOTIFICATION EMAIL:', emailData);
      return { success: true };
    } catch (error) {
      console.error('Error sending report notification:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send notification' 
      };
    }
  }

  private generateSupervisorVerificationTemplate(
    supervisorName: string,
    studentName: string,
    companyName: string,
    verificationLink: string
  ): string {
    return `
      <p>Dear ${supervisorName},</p>
      <p>You have been assigned as a supervisor for ${studentName} at ${companyName}.</p>
      <p>Please verify your account: <a href="${verificationLink}">Verify</a></p>
    `;
  }

  private generateTaskNotificationTemplate(
    recipientName: string,
    studentName: string,
    taskTitle: string,
    notificationType: 'submitted' | 'approved' | 'rejected',
    feedback?: string
  ): string {
    return `
      <p>Dear ${recipientName},</p>
      <p>Task status update for ${studentName}:</p>
      <p><strong>Task:</strong> ${taskTitle}</p>
      <p><strong>Status:</strong> ${notificationType}</p>
      ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
    `;
  }
  
  private generateReportNotificationTemplate(
    recipientName: string,
    studentName: string,
    reportTitle: string,
    notificationType: 'submitted' | 'approved' | 'rejected',
    feedback?: string
  ): string {
    return `
       <p>Dear ${recipientName},</p>
       <p>Report status update for ${studentName}:</p>
       <p><strong>Report:</strong> ${reportTitle}</p>
       <p><strong>Status:</strong> ${notificationType}</p>
       ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
    `;
  }
}

export const emailService = new EmailService();
export default EmailService;