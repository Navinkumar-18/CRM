import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../config/logger';

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpSecure,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
});

// Always use the authenticated user as From — Gmail rejects mismatched senders
const fromAddress = env.smtpUser
  ? `Zuna CRM <${env.smtpUser}>`
  : env.smtpFrom;

export const verifyTransporter = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    logger.info('SMTP transporter verified');
    return true;
  } catch (error) {
    logger.warn({ err: error }, 'SMTP transporter verification failed');
    return false;
  }
};

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    html,
  });
};

export const sendVerificationEmail = async (
  to: string,
  name: string,
  token: string,
) => {
  const link = `${env.frontendUrl}/verify-email/${token}`;
  await sendEmail(
    to,
    'Verify your Zuna CRM account',
    `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Zuna CRM!</h2>
        <p>Hi ${name},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">Verify Email</a>
        <p style="color: #64748b; font-size: 14px;">Or copy this link: ${link}</p>
        <p style="color: #94a3b8; font-size: 12px;">This link expires in 24 hours.</p>
      </div>
    `,
  );
};

export const sendResetPasswordEmail = async (
  to: string,
  name: string,
  token: string,
) => {
  const link = `${env.frontendUrl}/reset-password/${token}`;
  await sendEmail(
    to,
    'Reset your Zuna CRM password',
    `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset</h2>
        <p>Hi ${name},</p>
        <p>Click the button below to reset your password:</p>
        <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
        <p style="color: #64748b; font-size: 14px;">Or copy this link: ${link}</p>
        <p style="color: #94a3b8; font-size: 12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  );
};
