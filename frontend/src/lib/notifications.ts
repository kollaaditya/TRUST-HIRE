import { toast } from "sonner";

export interface NotificationData {
  email?: string;
  phone?: string;
  userName?: string;
  jobTitle?: string;
  employerName?: string;
  applicantName?: string;
}

export const sendNotification = async (
  type: 'signup' | 'job_posted' | 'job_applied' | 'application_received',
  data: NotificationData
) => {
  // In a real application, you would integrate with:
  // - Email services: SendGrid, Mailgun, AWS SES, Resend
  // - SMS services: Twilio, AWS SNS, MessageBird
  
  const messages = {
    signup: {
      email: `🎉 Welcome to TrustHire, ${data.userName}! Your account has been successfully created. Start exploring amazing job opportunities today!`,
      sms: `Welcome to TrustHire! Your account is ready. Start your job search now!`
    },
    job_posted: {
      email: `✅ Your job "${data.jobTitle}" has been posted successfully on TrustHire. Candidates can now discover and apply for this position!`,
      sms: `Job "${data.jobTitle}" posted successfully on TrustHire!`
    },
    job_applied: {
      email: `🚀 You have successfully applied for "${data.jobTitle}" at ${data.employerName}. The employer will review your application and get back to you soon.`,
      sms: `Application submitted for "${data.jobTitle}". Good luck!`
    },
    application_received: {
      email: `📋 New application received for "${data.jobTitle}" from ${data.applicantName}. Review the application in your TrustHire dashboard.`,
      sms: `New application for "${data.jobTitle}" from ${data.applicantName}.`
    }
  };

  const message = messages[type];
  
  // Simulate email sending
  if (data.email && message.email) {
    console.log(`📧 Email to ${data.email}:`, message.email);
    toast.success(`📧 Email notification sent to ${data.email}`);
  }
  
  // Simulate SMS sending
  if (data.phone && message.sms) {
    console.log(`📱 SMS to ${data.phone}:`, message.sms);
    toast.success(`📱 SMS notification sent to ${data.phone}`);
  }
  
  // In production, you would make actual API calls here:
  /*
  try {
    if (data.email) {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.email,
          subject: getEmailSubject(type),
          html: message.email
        })
      });
    }
    
    if (data.phone) {
      await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.phone,
          message: message.sms
        })
      });
    }
  } catch (error) {
    console.error('Notification sending failed:', error);
  }
  */
};

const getEmailSubject = (type: string): string => {
  const subjects = {
    signup: '🎉 Welcome to TrustHire!',
    job_posted: '✅ Job Posted Successfully',
    job_applied: '🚀 Application Submitted',
    application_received: '📋 New Job Application'
  };
  return subjects[type as keyof typeof subjects] || 'TrustHire Notification';
};
