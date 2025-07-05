import { storage } from "../storage";

interface EmailNotification {
  to: string;
  subject: string;
  body: string;
  type: 'signal' | 'alert' | 'system';
}

interface SMSNotification {
  to: string;
  message: string;
  type: 'signal' | 'alert' | 'system';
}

export class NotificationService {
  async sendEmail(notification: EmailNotification): Promise<boolean> {
    try {
      // Mock email service - in production, use SendGrid, AWS SES, or similar
      console.log('Email notification sent:', {
        to: notification.to,
        subject: notification.subject,
        body: notification.body,
        type: notification.type,
        timestamp: new Date().toISOString()
      });

      // Log the notification attempt
      await storage.createAdminLog({
        adminId: 'system',
        action: 'SEND_EMAIL',
        targetTable: 'notifications',
        targetId: notification.to,
        notes: `Email sent: ${notification.subject} to ${notification.to}`,
      });

      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendSMS(notification: SMSNotification): Promise<boolean> {
    try {
      // Mock SMS service - in production, use Twilio, AWS SNS, or similar
      console.log('SMS notification sent:', {
        to: notification.to,
        message: notification.message,
        type: notification.type,
        timestamp: new Date().toISOString()
      });

      // Log the notification attempt
      await storage.createAdminLog({
        adminId: 'system',
        action: 'SEND_SMS',
        targetTable: 'notifications',
        targetId: notification.to,
        notes: `SMS sent: ${notification.message.substring(0, 50)}... to ${notification.to}`,
      });

      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  async notifySignalAlert(userId: string, signal: {
    ticker: string;
    signalType: 'buy' | 'sell';
    price: number;
    confidence: number;
  }): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      const settings = await storage.getUserSettings(userId);
      
      if (!user || !settings) return;

      const message = `${signal.signalType.toUpperCase()} Signal for ${signal.ticker} at $${signal.price.toFixed(2)} (Confidence: ${signal.confidence}%)`;

      // Send email notification if enabled
      if (settings.emailSignalAlerts && user.email) {
        await this.sendEmail({
          to: user.email,
          subject: `CryptoStrategy Pro - ${signal.signalType.toUpperCase()} Signal Alert`,
          body: `
            <h2>Trading Signal Alert</h2>
            <p><strong>Symbol:</strong> ${signal.ticker}</p>
            <p><strong>Signal:</strong> ${signal.signalType.toUpperCase()}</p>
            <p><strong>Price:</strong> $${signal.price.toFixed(2)}</p>
            <p><strong>Confidence:</strong> ${signal.confidence}%</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <br>
            <p>Visit your dashboard to view more details and place trades.</p>
          `,
          type: 'signal'
        });
      }

      // Send SMS notification if enabled and phone number available
      // Note: phoneNumber field would need to be added to user schema for SMS functionality
      const phoneNumber = (user as any).phoneNumber;
      if (settings.smsSignalAlerts && phoneNumber) {
        await this.sendSMS({
          to: phoneNumber,
          message: message,
          type: 'signal'
        });
      }
    } catch (error) {
      console.error('Failed to send signal notification:', error);
    }
  }

  async notifyPriceAlert(userId: string, alert: {
    ticker: string;
    targetPrice: number;
    currentPrice: number;
    condition: 'above' | 'below';
  }): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      const settings = await storage.getUserSettings(userId);
      
      if (!user || !settings) return;

      const message = `Price Alert: ${alert.ticker} is now ${alert.condition} $${alert.targetPrice.toFixed(2)} (Current: $${alert.currentPrice.toFixed(2)})`;

      // Send email notification if enabled
      if (settings.notificationEmail && user.email) {
        await this.sendEmail({
          to: user.email,
          subject: `CryptoStrategy Pro - Price Alert Triggered`,
          body: `
            <h2>Price Alert Triggered</h2>
            <p><strong>Symbol:</strong> ${alert.ticker}</p>
            <p><strong>Condition:</strong> Price ${alert.condition} $${alert.targetPrice.toFixed(2)}</p>
            <p><strong>Current Price:</strong> $${alert.currentPrice.toFixed(2)}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <br>
            <p>Visit your dashboard to manage your alerts and view market data.</p>
          `,
          type: 'alert'
        });
      }

      // Send SMS notification if enabled
      const phoneNumber = (user as any).phoneNumber;
      if (settings.notificationSms && phoneNumber) {
        await this.sendSMS({
          to: phoneNumber,
          message: message,
          type: 'alert'
        });
      }
    } catch (error) {
      console.error('Failed to send price alert notification:', error);
    }
  }

  async notifySystemUpdate(userId: string, update: {
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'critical';
  }): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      const settings = await storage.getUserSettings(userId);
      
      if (!user || !settings) return;

      // Only send notifications for warnings and critical updates
      if (update.severity === 'info' && !settings.notificationEmail) return;

      const message = `${update.title}: ${update.message}`;

      if (settings.notificationEmail && user.email) {
        await this.sendEmail({
          to: user.email,
          subject: `CryptoStrategy Pro - ${update.title}`,
          body: `
            <h2>${update.title}</h2>
            <p>${update.message}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <br>
            <p>Thank you for using CryptoStrategy Pro.</p>
          `,
          type: 'system'
        });
      }

      // Send SMS for critical updates only
      const phoneNumber = (user as any).phoneNumber;
      if (update.severity === 'critical' && settings.notificationSms && phoneNumber) {
        await this.sendSMS({
          to: phoneNumber,
          message: `CRITICAL: ${message}`,
          type: 'system'
        });
      }
    } catch (error) {
      console.error('Failed to send system notification:', error);
    }
  }

  async broadcastSignalToAllUsers(signal: {
    ticker: string;
    signalType: 'buy' | 'sell';
    price: number;
    confidence: number;
  }): Promise<void> {
    try {
      const users = await storage.getAllUsers();
      
      // Send notifications to all active users with signal alerts enabled
      for (const user of users) {
        if (user.isActive) {
          await this.notifySignalAlert(user.id, signal);
          // Small delay to avoid overwhelming notification services
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error('Failed to broadcast signal to users:', error);
    }
  }
}

export const notificationService = new NotificationService();