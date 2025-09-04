import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

interface ErrorWithMessage {
  message: string;
  stack?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private emailsFromName: string;
  private emailsFromEmail: string;
  private emailVerificationTokenExpireHours: number = 24;
  private passwordResetTokenExpireHours: number = 24;

  constructor(private readonly configService: ConfigService) {
    const resendApiKey = this.configService.getOrThrow<string>('email.resend.apiKey');
    this.emailsFromName = this.configService.getOrThrow<string>('email.from.name');
    this.emailsFromEmail = this.configService.getOrThrow<string>('email.from.email');

    this.resend = new Resend(resendApiKey);
    this.logger.log('Email service initialized with Resend');
  }

  private async sendEmail(emailTo: string, subject: string, htmlContent: string): Promise<boolean> {
    try {
      const params = {
        from: `${this.emailsFromName} <${this.emailsFromEmail}>`,
        to: [emailTo],
        subject: subject,
        html: htmlContent,
      };

      const { data, error } = await this.resend.emails.send(params);

      if (error) {
        this.logger.error(`Error sending email to ${emailTo}: ${error.message}`);
        return false;
      }

      this.logger.log(`Email sent successfully to ${emailTo}, ID: ${data?.id}`);
      return true;
    } catch (error) {
      const typedError = error as ErrorWithMessage;
      this.logger.error(`Failed to send email: ${typedError.message}`, typedError.stack);
      return false;
    }
  }

  async sendVerificationEmail(appName: string, emailTo: string, code: string): Promise<boolean> {
    try {
      const subject = `Verify your email for ${appName}`;
      const htmlContent = `
      <html>
      <body>
          <p>Hi,</p>
          <p><strong>${code}</strong> is your verification code.</p>
          <p>Please enter this code on the verification page to complete your registration.</p>
          <p>This code will expire in ${this.emailVerificationTokenExpireHours} hour(s).</p>
          <p>If you did not register for an account, please ignore this email.</p>
          <p>Thank you for registering with ${appName}<br/>The ${this.emailsFromName}</p>
      </body>
      </html>
      `;

      this.logger.log(`Sending verification email to ${emailTo} with code ${code}`);

      return this.sendEmail(emailTo, subject, htmlContent);
    } catch (error) {
      const typedError = error as ErrorWithMessage;
      this.logger.error(
        `Failed to send verification email: ${typedError.message}`,
        typedError.stack
      );
      return false;
    }
  }

  async sendPasswordResetEmail(appName: string, emailTo: string, code: string): Promise<boolean> {
    try {
      const subject = `${appName} - Password Reset Request`;
      const htmlContent = `
      <html>
      <body>
          <p>Hi,</p>
          <p>You requested a password reset for your ${appName} account.</p>
          <p>Your password reset code is: <strong>${code}</strong></p>
          <p>Please enter this code on the password reset page to create a new password.</p>
          <p>This code will expire in ${this.passwordResetTokenExpireHours} hour(s) and you have 5 attempts to use it.</p>
          <p>If you did not request this, please ignore this email.</p>
          <p>Thanks,<br/>The ${this.emailsFromName}</p>
      </body>
      </html>
      `;

      this.logger.log(`Sending password reset email to ${emailTo} with code ${code}`);

      return this.sendEmail(emailTo, subject, htmlContent);
    } catch (error) {
      const typedError = error as ErrorWithMessage;
      this.logger.error(
        `Failed to send password reset email: ${typedError.message}`,
        typedError.stack
      );
      return false;
    }
  }
}
