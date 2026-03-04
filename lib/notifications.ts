import { prisma } from "./prisma";

export interface NotificationConfig {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
}

export interface AppointmentReminder {
  appointmentId: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  doctorName: string;
  dateTime: Date;
  locationName?: string;
  appointmentType?: string;
}

export class NotificationService {
  private config: NotificationConfig = {
    emailEnabled: process.env.EMAIL_ENABLED === "true",
    smsEnabled: process.env.SMS_ENABLED === "true",
    pushEnabled: process.env.PUSH_ENABLED === "true"
  };

  /**
   * Send appointment confirmation
   */
  async sendAppointmentConfirmation(reminder: AppointmentReminder): Promise<void> {
    const tasks: Promise<void>[] = [];

    // Get user's notification preferences
    const preferences = await this.getUserPreferences(reminder.patientEmail);

    if (preferences.email && this.config.emailEnabled) {
      tasks.push(this.sendEmailConfirmation(reminder));
    }

    if (preferences.sms && this.config.smsEnabled && reminder.patientPhone) {
      tasks.push(this.sendSmsConfirmation(reminder));
    }

    await Promise.all(tasks);
  }

  /**
   * Send appointment reminder (24 hours before)
   */
  async sendAppointmentReminder(reminder: AppointmentReminder): Promise<void> {
    const tasks: Promise<void>[] = [];

    const preferences = await this.getUserPreferences(reminder.patientEmail);

    if (preferences.email && this.config.emailEnabled) {
      tasks.push(this.sendEmailReminder(reminder));
    }

    if (preferences.sms && this.config.smsEnabled && reminder.patientPhone) {
      tasks.push(this.sendSmsReminder(reminder));
    }

    await Promise.all(tasks);
  }

  /**
   * Send appointment cancellation notice
   */
  async sendAppointmentCancellation(reminder: AppointmentReminder, reason?: string): Promise<void> {
    const preferences = await this.getUserPreferences(reminder.patientEmail);

    if (preferences.email && this.config.emailEnabled) {
      await this.sendEmailCancellation(reminder, reason);
    }

    if (preferences.sms && this.config.smsEnabled && reminder.patientPhone) {
      await this.sendSmsCancellation(reminder, reason);
    }
  }

  /**
   * Get user notification preferences
   */
  private async getUserPreferences(patientEmail: string): Promise<{
    email: boolean;
    sms: boolean;
    push: boolean;
  }> {
    const user = await prisma.user.findUnique({
      where: { email: patientEmail },
      include: { notificationPreferences: true }
    });

    if (!user) {
      return { email: true, sms: false, push: false };
    }

    const prefs = user.notificationPreferences;
    const emailPref = prefs.find(p => p.channel === "EMAIL");
    const smsPref = prefs.find(p => p.channel === "SMS");
    const pushPref = prefs.find(p => p.channel === "PUSH");

    return {
      email: emailPref?.enabled ?? true,
      sms: smsPref?.enabled ?? false,
      push: pushPref?.enabled ?? false
    };
  }

  /**
   * Email confirmation
   */
  private async sendEmailConfirmation(reminder: AppointmentReminder): Promise<void> {
    // In production, integrate with SendGrid, AWS SES, etc.
    console.log(`[EMAIL] Appointment Confirmation to ${reminder.patientEmail}`);
    console.log(`Subject: Appointment Confirmed - ${reminder.doctorName}`);
    console.log(`Body: Your appointment is confirmed for ${reminder.dateTime.toLocaleString()}`);
    
    // TODO: Implement actual email sending
    // await sendGrid.send({ ... });
  }

  /**
   * Email reminder
   */
  private async sendEmailReminder(reminder: AppointmentReminder): Promise<void> {
    console.log(`[EMAIL] Appointment Reminder to ${reminder.patientEmail}`);
    console.log(`Subject: Reminder: Appointment Tomorrow with ${reminder.doctorName}`);
    console.log(`Body: This is a reminder for your appointment on ${reminder.dateTime.toLocaleString()}`);
  }

  /**
   * Email cancellation
   */
  private async sendEmailCancellation(reminder: AppointmentReminder, reason?: string): Promise<void> {
    console.log(`[EMAIL] Appointment Cancellation to ${reminder.patientEmail}`);
    console.log(`Subject: Appointment Cancelled - ${reminder.doctorName}`);
    console.log(`Body: Your appointment has been cancelled. ${reason ? `Reason: ${reason}` : ''}`);
  }

  /**
   * SMS confirmation
   */
  private async sendSmsConfirmation(reminder: AppointmentReminder): Promise<void> {
    if (!reminder.patientPhone) return;

    const message = `Appointment confirmed with ${reminder.doctorName} on ${reminder.dateTime.toLocaleDateString()} at ${reminder.dateTime.toLocaleTimeString()}. Reply C to cancel.`;
    
    console.log(`[SMS] to ${reminder.patientPhone}: ${message}`);
    
    // TODO: Implement actual SMS sending via Twilio
    // await twilio.messages.create({ ... });
  }

  /**
   * SMS reminder
   */
  private async sendSmsReminder(reminder: AppointmentReminder): Promise<void> {
    if (!reminder.patientPhone) return;

    const message = `Reminder: Appointment with ${reminder.doctorName} tomorrow at ${reminder.dateTime.toLocaleTimeString()}. Reply C to cancel.`;
    
    console.log(`[SMS] to ${reminder.patientPhone}: ${message}`);
  }

  /**
   * SMS cancellation
   */
  private async sendSmsCancellation(reminder: AppointmentReminder, reason?: string): Promise<void> {
    if (!reminder.patientPhone) return;

    const message = `Your appointment with ${reminder.doctorName} has been cancelled. ${reason || ''}`;
    
    console.log(`[SMS] to ${reminder.patientPhone}: ${message}`);
  }

  /**
   * Send bulk reminders for upcoming appointments
   */
  async sendBulkReminders(hoursBefore: number = 24): Promise<{
    sent: number;
    failed: number;
  }> {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + hoursBefore * 60 * 60 * 1000);
    const nextDay = new Date(reminderTime.getTime() + 24 * 60 * 60 * 1000);

    const appointments = await prisma.appointment.findMany({
      where: {
        dateTime: {
          gte: reminderTime,
          lt: nextDay
        },
        status: "CONFIRMED"
      },
      include: {
        patient: {
          select: {
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        doctor: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        location: {
          select: { name: true }
        },
        appointmentType: {
          select: { name: true }
        }
      }
    });

    let sent = 0;
    let failed = 0;

    for (const apt of appointments) {
      try {
        await this.sendAppointmentReminder({
          appointmentId: apt.id,
          patientName: apt.patient.name || "",
          patientEmail: apt.patient.email,
          patientPhone: apt.patient.phoneNumber || undefined,
          doctorName: apt.doctor.user.name || "Doctor",
          dateTime: apt.dateTime,
          locationName: apt.location?.name,
          appointmentType: apt.appointmentType?.name
        });
        sent++;
      } catch (error) {
        console.error("Failed to send reminder:", error);
        failed++;
      }
    }

    return { sent, failed };
  }
}

export const notificationService = new NotificationService();
