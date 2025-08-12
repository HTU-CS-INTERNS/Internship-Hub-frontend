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
        ? `${process.env.NEXT_PUBLIC_APP_URL}/supervisor-verification?token=${verificationToken}&email=${encodeURIComponent(supervisorEmail)}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/supervisor-verification`;

      const emailTemplate = this.generateSupervisorVerificationTemplate(
        supervisorName,
        studentName,
        companyName,
        verificationLink
      );

      // In production, you would use a real email service (SendGrid, Resend, etc.)
      // For now, we'll log the email and store it in a notifications table
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

      // Store email notification in database
      const { error } = await supabase.from('email_notifications').insert({
        recipient_email: emailData.to,
        subject: emailData.subject,
        html_content: emailData.html,
        template_type: emailData.templateType,
        metadata: emailData.metadata,
        status: 'sent', // In production, this would be 'pending' until actually sent
        sent_at: new Date().toISOString()
      });

      if (error) {
        console.error('Error storing email notification:', error);
        return { success: false, error: error.message };
      }

      // TODO: In production, send actual email here
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
    studentName: string,
    taskTitle: string,
    notificationType: 'submitted' | 'approved' | 'rejected',
    feedback?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const emailTemplate = this.generateTaskNotificationTemplate(
        recipientName,
        studentName,
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
          studentName,
          taskTitle,
          notificationType,
          feedback
        }
      };

      // Store email notification in database
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
    studentName?: string, // studentName is optional here now
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

      // Store email notification in database
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

  /**
   * Generate supervisor verification email template
   */
  private generateSupervisorVerificationTemplate(
    supervisorName: string,
    studentName: string,
    companyName: string,
    verificationLink: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Supervisor Account Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Internship Hub</h1>
            <h2>Supervisor Account Verification</h2>
          </div>
          <div class="content">
            <p>Dear ${supervisorName},</p>
            
            <p>You have been assigned as a company supervisor for <strong>${studentName}</strong> from our internship program. The student will be completing their internship at <strong>${companyName}</strong>.</p>
            
            <p>To monitor the student's progress, approve daily tasks, and provide feedback, please verify your supervisor account by clicking the button below:</p>
            
            <p style="text-align: center;">
              <a href="${verificationLink}" class="button">Verify Supervisor Account</a>
            </p>
            
            <p>As a supervisor, you will be able to:</p>
            <ul>
              <li>View and approve student daily tasks</li>
              <li>Provide feedback on student reports</li>
              <li>Monitor student check-ins and location</li>
              <li>Evaluate student performance</li>
              <li>Communicate directly with the student and lecturer</li>
            </ul>
            
            <p>If you did not expect this email or believe this is an error, please contact the university administration.</p>
            
            <p>Thank you for supporting our internship program!</p>
            
            <p>Best regards,<br>Internship Hub Team</p>
          </div>
          <div class="footer">
            <p>This email was sent automatically. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate task notification email template
   */
  private generateTaskNotificationTemplate(
    recipientName: string,
    studentName: string,
    taskTitle: string,
    notificationType: 'submitted' | 'approved' | 'rejected',
    feedback?: string
  ): string {
    const statusColor = notificationType === 'approved' ? '#16a34a' : notificationType === 'rejected' ? '#dc2626' : '#2563eb';
    const statusText = notificationType.charAt(0).toUpperCase() + notificationType.slice(1);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task ${statusText} Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusColor}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .status-badge { background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: bold; }
          .feedback-box { background: #fff; border-left: 4px solid ${statusColor}; padding: 15px; margin: 15px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Internship Hub</h1>
            <h2>Task ${statusText}</h2>
          </div>
          <div class="content">
            <p>Dear ${recipientName},</p>
            
            <p>A task has been <span class="status-badge">${statusText.toUpperCase()}</span></p>
            
            <p><strong>Student:</strong> ${studentName}</p>
            <p><strong>Task:</strong> ${taskTitle}</p>
            <p><strong>Status:</strong> ${statusText}</p>
            
            ${feedback ? `
              <div class="feedback-box">
                <h4>Feedback:</h4>
                <p>${feedback}</p>
              </div>
            ` : ''}
            
            <p>Please log in to your dashboard to view more details and take any necessary actions.</p>
            
            <p>Best regards,<br>Internship Hub Team</p>
          </div>
          <div class="footer">
            <p>This email was sent automatically. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate report notification email template
   */
  private generateReportNotificationTemplate(
    recipientName: string,
    studentName: string,
    reportTitle: string,
    notificationType: 'submitted' | 'approved' | 'rejected',
    feedback?: string
  ): string {
    const statusColor = notificationType === 'approved' ? '#16a34a' : notificationType === 'rejected' ? '#dc2626' : '#2563eb';
    const statusText = notificationType.charAt(0).toUpperCase() + notificationType.slice(1);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Report ${statusText} Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusColor}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .status-badge { background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: bold; }
          .feedback-box { background: #fff; border-left: 4px solid ${statusColor}; padding: 15px; margin: 15px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Internship Hub</h1>
            <h2>Report ${statusText}</h2>
          </div>
          <div class="content">
            <p>Dear ${recipientName},</p>
            
            <p>A report has been <span class="status-badge">${statusText.toUpperCase()}</span></p>
            
            <p><strong>Student:</strong> ${studentName}</p>
            <p><strong>Report:</strong> ${reportTitle}</p>
            <p><strong>Status:</strong> ${statusText}</p>
            
            ${feedback ? `
              <div class="feedback-box">
                <h4>Feedback:</h4>
                <p>${feedback}</p>
              </div>
            ` : ''}
            
            <p>Please log in to your dashboard to view more details and take any necessary actions.</p>
            
            <p>Best regards,<br>Internship Hub Team</p>
          </div>
          <div class="footer">
            <p>This email was sent automatically. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send task approval notification to student
   */
  async sendTaskApprovalNotification(
    studentEmail: string,
    studentName: string,
    status: 'APPROVED' | 'REJECTED',
    feedback?: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendTaskNotificationEmail(
      studentEmail,
      studentName,
      'Daily Task',
      status.toLowerCase() as 'approved' | 'rejected',
      feedback
    );
  }

  /**
   * Send report approval notification to student
   */
  async sendReportApprovalNotification(
    studentEmail: string,
    studentName: string,
    status: 'APPROVED' | 'REJECTED',
    feedback?: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendReportNotificationEmail(
      studentEmail,
      studentName,
      'Daily Report',
      status.toLowerCase() as 'approved' | 'rejected',
      feedback
    );
  }

  /**
   * Get email notifications for a recipient
   */
  async getEmailNotifications(recipientEmail: string): Promise<EmailNotification[]> {
    try {
      const { data, error } = await supabase
        .from('email_notifications')
        .select('*')
        .eq('recipient_email', recipientEmail)
        .order('sent_at', { ascending: false });

      if (error) {
        console.error('Error fetching email notifications:', error);
        return [];
      }

      return data.map(notification => ({
        to: notification.recipient_email,
        subject: notification.subject,
        html: notification.html_content,
        templateType: notification.template_type as any,
        metadata: notification.metadata || undefined
      }));
    } catch (error) {
      console.error('Error getting email notifications:', error);
      return [];
    }
  }
}

export const emailService = new EmailService();
export default EmailService;

    