import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Email configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "Icdboanalytics@gmail.com";
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || "";
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || "Icdboanalytics@gmail.com";
const COMPANY_NAME = process.env.COMPANY_NAME || "ICDBO Analytics";
const APP_URL = process.env.APP_URL || "http://localhost:5173";

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465 (SSL), false for 587 (TLS)
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

// Verify transporter connection on startup
export async function verifyEmailService(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log("✅ Email service connected successfully");
    return true;
  } catch (error) {
    console.error("❌ Email service connection failed:", error);
    return false;
  }
}

/**
 * Send email verification code to user
 */
export async function sendVerificationEmail(
  email: string,
  verificationCode: string,
  userName: string
): Promise<boolean> {
  try {
    const verificationLink = `${APP_URL}/verify-email?code=${verificationCode}&email=${encodeURIComponent(email)}`;

    const htmlContent = generateVerificationEmailTemplate(
      userName,
      verificationCode,
      verificationLink
    );

    const info = await transporter.sendMail({
      from: `"${COMPANY_NAME}" <${COMPANY_EMAIL}>`,
      to: email,
      subject: `Email Verification - ${COMPANY_NAME}`,
      html: htmlContent,
    });

    console.log("✅ Verification email sent to:", email, "Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
    return false;
  }
}

/**
 * Send login two-factor code to user
 */
export async function sendTwoFactorCodeEmail(
  email: string,
  twoFactorCode: string,
  userName: string
): Promise<boolean> {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #111827;">
        <h2 style="margin: 0 0 12px;">Two-Factor Authentication Code</h2>
        <p style="margin: 0 0 16px;">Hi ${userName}, use this code to complete your sign in:</p>
        <div style="font-size: 30px; letter-spacing: 8px; font-weight: 700; background: #f3f4f6; padding: 14px 16px; border-radius: 10px; text-align: center;">
          ${twoFactorCode}
        </div>
        <p style="margin: 16px 0 0; color: #4b5563;">This code expires in 10 minutes.</p>
        <p style="margin: 8px 0 0; color: #4b5563;">If you did not try to sign in, change your password immediately.</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"${COMPANY_NAME}" <${COMPANY_EMAIL}>`,
      to: email,
      subject: `Your 2FA Code - ${COMPANY_NAME}`,
      html: htmlContent,
    });

    console.log("✅ Two-factor code email sent to:", email, "Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send two-factor code email:", error);
    return false;
  }
}

/**
 * Send welcome email to newly registered user
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string
): Promise<boolean> {
  try {
    const htmlContent = generateWelcomeEmailTemplate(userName);

    const info = await transporter.sendMail({
      from: `"${COMPANY_NAME}" <${COMPANY_EMAIL}>`,
      to: email,
      subject: `Welcome to ${COMPANY_NAME}!`,
      html: htmlContent,
    });

    console.log("✅ Welcome email sent to:", email, "Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error);
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName: string
): Promise<boolean> {
  try {
    const resetLink = `${APP_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const htmlContent = generatePasswordResetEmailTemplate(
      userName,
      resetLink
    );

    const info = await transporter.sendMail({
      from: `"${COMPANY_NAME}" <${COMPANY_EMAIL}>`,
      to: email,
      subject: `Password Reset Request - ${COMPANY_NAME}`,
      html: htmlContent,
    });

    console.log("✅ Password reset email sent to:", email, "Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error);
    return false;
  }
}

/**
 * Send reminder/notification email
 */
export async function sendReminderEmail(
  email: string,
  subject: string,
  userName: string,
  message: string,
  actionUrl?: string
): Promise<boolean> {
  try {
    const htmlContent = generateReminderEmailTemplate(
      userName,
      message,
      actionUrl
    );

    const info = await transporter.sendMail({
      from: `"${COMPANY_NAME}" <${COMPANY_EMAIL}>`,
      to: email,
      subject: subject,
      html: htmlContent,
    });

    console.log("✅ Reminder email sent to:", email, "Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send reminder email:", error);
    return false;
  }
}

/**
 * Send inquiry notification email to recipient
 */
export async function sendInquiryNotificationEmail(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  senderEmail: string,
  message: string,
  inquiryId: string
): Promise<boolean> {
  try {
    const replyLink = `${APP_URL}/inquiries/${inquiryId}`;

    const htmlContent = generateInquiryNotificationTemplate(
      recipientName,
      senderName,
      senderEmail,
      message,
      replyLink
    );

    const info = await transporter.sendMail({
      from: `"${COMPANY_NAME}" <${COMPANY_EMAIL}>`,
      to: recipientEmail,
      subject: `New Inquiry from ${senderName} - ${COMPANY_NAME}`,
      html: htmlContent,
    });

    console.log("✅ Inquiry notification sent to:", recipientEmail, "Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send inquiry notification email:", error);
    return false;
  }
}

/**
 * Send inquiry reply notification email
 */
export async function sendInquiryReplyNotificationEmail(
  senderEmail: string,
  senderName: string,
  replierName: string,
  replyMessage: string,
  inquiryId: string
): Promise<boolean> {
  try {
    const replyLink = `${APP_URL}/inquiries/${inquiryId}`;

    const htmlContent = generateInquiryReplyNotificationTemplate(
      senderName,
      replierName,
      replyMessage,
      replyLink
    );

    const info = await transporter.sendMail({
      from: `"${COMPANY_NAME}" <${COMPANY_EMAIL}>`,
      to: senderEmail,
      subject: `Reply to Your Inquiry - ${COMPANY_NAME}`,
      html: htmlContent,
    });

    console.log("✅ Inquiry reply notification sent to:", senderEmail, "Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send inquiry reply notification email:", error);
    return false;
  }
}

// =====================
// EMAIL TEMPLATES
// =====================

const applyBrandedEmailTheme = (html: string): string => {
  const replacements: Array<[string, string]> = [
    ["#667eea", "#b7d52a"],
    ["#764ba2", "#8fa51f"],
    ["#f093fb", "#b7d52a"],
    ["#f5576c", "#8fa51f"],
    ["#4facfe", "#b7d52a"],
    ["#00f2fe", "#8fa51f"],
    ["#11998e", "#b7d52a"],
    ["#38ef7d", "#8fa51f"],
    ["#f0f4ff", "#111a3a"],
    ["#f0fdf4", "#111a3a"],
    ["#f5f5f5", "#0b1026"],
    ["#f9f9f9", "#111a3a"],
    ["#e0e0e0", "#1e2a57"],
    ["#333", "#e9edf8"],
    ["#444", "#d7def0"],
    ["#666", "#b7c1da"],
    ["#fff3cd", "#233114"],
    ["#ffc107", "#b7d52a"],
    ["#856404", "#e5f2b8"],
    ["#d32f2f", "#ff9f9f"],
  ];

  return replacements.reduce((acc, [from, to]) => acc.split(from).join(to), html);
};

function generateVerificationEmailTemplate(
  userName: string,
  verificationCode: string,
  verificationLink: string
): string {
  return applyBrandedEmailTheme(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px;
        }
        .greeting {
          font-size: 16px;
          margin-bottom: 20px;
          color: #333;
        }
        .verification-section {
          background-color: #f9f9f9;
          border-left: 4px solid #667eea;
          padding: 20px;
          margin: 30px 0;
          border-radius: 4px;
        }
        .code {
          font-size: 32px;
          font-weight: bold;
          color: #667eea;
          text-align: center;
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
          margin: 20px 0;
          padding: 15px;
          background-color: #ffffff;
          border-radius: 4px;
          border: 2px dashed #667eea;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          padding: 12px 40px;
          border-radius: 5px;
          display: inline-block;
          font-weight: 600;
          transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-2px);
        }
        .expiry-warning {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          color: #856404;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
          font-size: 14px;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e0e0e0;
          font-size: 12px;
          color: #666;
        }
        .footer p {
          margin: 5px 0;
        }
        .warning-text {
          color: #d32f2f;
          font-size: 13px;
          margin-top: 15px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Secure Your Account</p>
        </div>
        
        <div class="content">
          <p class="greeting">Hi ${userName},</p>
          
          <p>Thank you for registering with ${COMPANY_NAME}! To complete your registration and secure your account, please verify your email address.</p>
          
          <div class="verification-section">
            <p style="margin-top: 0; color: #666; font-size: 14px;">Your verification code is:</p>
            <div class="code">${verificationCode}</div>
            <p style="margin-bottom: 0; color: #666; font-size: 14px;">Copy and paste this code into the verification field on our website.</p>
          </div>
          
          <div class="button-container">
            <a href="${verificationLink}" class="button">Verify Email</a>
          </div>
          
          <p style="text-align: center; color: #666; font-size: 13px;">Or copy this link:</p>
          <p style="text-align: center; color: #667eea; word-break: break-all; font-size: 12px;">
            <a href="${verificationLink}" style="color: #667eea; text-decoration: none;">${verificationLink}</a>
          </p>
          
          <div class="expiry-warning">
            <strong>⏱️ This verification code expires in 24 hours.</strong> Please verify your email as soon as possible.
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            If you didn't create an account with us, please ignore this email or contact our support team.
          </p>
          
          <div class="warning-text">
            ⚠️ Never share this code with anyone. Our team will never ask for it.
          </div>
        </div>
        
        <div class="footer">
          <p><strong>${COMPANY_NAME}</strong></p>
          <p>Questions? Contact us at <a href="mailto:${COMPANY_EMAIL}" style="color: #667eea; text-decoration: none;">${COMPANY_EMAIL}</a></p>
          <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `);
}

function generateWelcomeEmailTemplate(userName: string): string {
  return applyBrandedEmailTheme(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px;
        }
        .feature-box {
          background-color: #f9f9f9;
          border: 1px solid #e0e0e0;
          padding: 15px;
          margin: 15px 0;
          border-radius: 4px;
        }
        .feature-title {
          color: #667eea;
          font-weight: 600;
          margin: 0 0 5px 0;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          padding: 12px 40px;
          border-radius: 5px;
          display: inline-block;
          font-weight: 600;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e0e0e0;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ${COMPANY_NAME}! 🎉</h1>
        </div>
        
        <div class="content">
          <p>Hi ${userName},</p>
          
          <p>We're thrilled to have you join our community! Your account has been successfully created and verified.</p>
          
          <h3 style="color: #667eea; margin-top: 30px;">What you can do now:</h3>
          
          <div class="feature-box">
            <p class="feature-title">📊 Access the Dashboard</p>
            <p style="margin: 0; color: #666;">View all your projects, inquiries, and communications in one place.</p>
          </div>
          
          <div class="feature-box">
            <p class="feature-title">💬 Connect with Others</p>
            <p style="margin: 0; color: #666;">Send inquiries and collaborate with professionals in the construction industry.</p>
          </div>
          
          <div class="feature-box">
            <p class="feature-title">🤖 Use AI Assistant</p>
            <p style="margin: 0; color: #666;">Get expert guidance and support from our intelligent assistant.</p>
          </div>
          
          <div class="button-container">
            <a href="${APP_URL}/dashboard" class="button">Go to Dashboard</a>
          </div>
          
          <p style="color: #666; margin-top: 30px;">
            If you have any questions or need help getting started, don't hesitate to reach out to our support team.
          </p>
        </div>
        
        <div class="footer">
          <p><strong>${COMPANY_NAME}</strong></p>
          <p>Support: <a href="mailto:${COMPANY_EMAIL}" style="color: #667eea; text-decoration: none;">${COMPANY_EMAIL}</a></p>
          <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `);
}

function generatePasswordResetEmailTemplate(
  userName: string,
  resetLink: string
): string {
  return applyBrandedEmailTheme(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px;
        }
        .warning-box {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          color: #856404;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          text-decoration: none;
          padding: 12px 40px;
          border-radius: 5px;
          display: inline-block;
          font-weight: 600;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e0e0e0;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        
        <div class="content">
          <p>Hi ${userName},</p>
          
          <p>We received a request to reset your password. Click the button below to create a new password.</p>
          
          <div class="button-container">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          
          <p style="text-align: center; color: #666; font-size: 13px;">Or copy this link:</p>
          <p style="text-align: center; color: #f5576c; word-break: break-all; font-size: 12px;">
            <a href="${resetLink}" style="color: #f5576c; text-decoration: none;">${resetLink}</a>
          </p>
          
          <div class="warning-box">
            <strong>⏱️ This password reset link expires in 1 hour.</strong>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If you didn't request a password reset, please ignore this email. Your account remains secure.
          </p>
        </div>
        
        <div class="footer">
          <p><strong>${COMPANY_NAME}</strong></p>
          <p>Questions? Contact us at <a href="mailto:${COMPANY_EMAIL}" style="color: #f5576c; text-decoration: none;">${COMPANY_EMAIL}</a></p>
          <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `);
}

function generateReminderEmailTemplate(
  userName: string,
  message: string,
  actionUrl?: string
): string {
  return applyBrandedEmailTheme(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px;
        }
        .message-box {
          background-color: #f0f4ff;
          border-left: 4px solid #4facfe;
          padding: 20px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          text-decoration: none;
          padding: 12px 40px;
          border-radius: 5px;
          display: inline-block;
          font-weight: 600;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e0e0e0;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📬 Reminder from ${COMPANY_NAME}</h1>
        </div>
        
        <div class="content">
          <p>Hi ${userName},</p>
          
          <div class="message-box">
            ${message}
          </div>
          
          ${actionUrl ? `
          <div class="button-container">
            <a href="${actionUrl}" class="button">Take Action</a>
          </div>
          ` : ''}
          
          <p style="color: #666; font-size: 14px;">
            This is an automated reminder from ${COMPANY_NAME}. Please don't reply to this email.
          </p>
        </div>
        
        <div class="footer">
          <p><strong>${COMPANY_NAME}</strong></p>
          <p>Questions? Contact us at <a href="mailto:${COMPANY_EMAIL}" style="color: #4facfe; text-decoration: none;">${COMPANY_EMAIL}</a></p>
          <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `);
}

function generateInquiryNotificationTemplate(
  recipientName: string,
  senderName: string,
  senderEmail: string,
  message: string,
  replyLink: string
): string {
  return applyBrandedEmailTheme(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px;
        }
        .sender-info {
          background-color: #f9f9f9;
          border: 1px solid #e0e0e0;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .message-box {
          background-color: #f0f4ff;
          border-left: 4px solid #667eea;
          padding: 20px;
          border-radius: 4px;
          margin: 20px 0;
          font-style: italic;
          color: #444;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          padding: 12px 40px;
          border-radius: 5px;
          display: inline-block;
          font-weight: 600;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e0e0e0;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💬 New Inquiry Received</h1>
        </div>
        
        <div class="content">
          <p>Hi ${recipientName},</p>
          
          <p>You have received a new inquiry on ${COMPANY_NAME}!</p>
          
          <div class="sender-info">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 13px;">From:</p>
            <p style="margin: 0; font-weight: 600; font-size: 16px;">${senderName}</p>
            <p style="margin: 5px 0 0 0; color: #667eea; font-size: 14px;">
              <a href="mailto:${senderEmail}" style="color: #667eea; text-decoration: none;">${senderEmail}</a>
            </p>
          </div>
          
          <p style="color: #666; margin: 20px 0;">Message:</p>
          <div class="message-box">${message}</div>
          
          <p>Please review this inquiry and respond as soon as possible.</p>
          
          <div class="button-container">
            <a href="${replyLink}" class="button">View & Reply to Inquiry</a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>${COMPANY_NAME}</strong></p>
          <p>Support: <a href="mailto:${COMPANY_EMAIL}" style="color: #667eea; text-decoration: none;">${COMPANY_EMAIL}</a></p>
          <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `);
}

function generateInquiryReplyNotificationTemplate(
  senderName: string,
  replierName: string,
  replyMessage: string,
  replyLink: string
): string {
  return applyBrandedEmailTheme(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px;
        }
        .reply-box {
          background-color: #f0fdf4;
          border-left: 4px solid #38ef7d;
          padding: 20px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          text-decoration: none;
          padding: 12px 40px;
          border-radius: 5px;
          display: inline-block;
          font-weight: 600;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e0e0e0;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ New Reply to Your Inquiry</h1>
        </div>
        
        <div class="content">
          <p>Hi ${senderName},</p>
          
          <p><strong>${replierName}</strong> has replied to your inquiry on ${COMPANY_NAME}!</p>
          
          <div class="reply-box">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 13px;">Reply:</p>
            <p style="margin: 0; color: #333; line-height: 1.6;">${replyMessage}</p>
          </div>
          
          <p>Check the full inquiry thread to continue the conversation.</p>
          
          <div class="button-container">
            <a href="${replyLink}" class="button">View Reply</a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>${COMPANY_NAME}</strong></p>
          <p>Support: <a href="mailto:${COMPANY_EMAIL}" style="color: #38ef7d; text-decoration: none;">${COMPANY_EMAIL}</a></p>
          <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `);
}

  /**
   * Send milestone created notification email
   */
  export async function sendMilestoneCreatedEmail(
    clientEmail: string,
    clientName: string,
    projectTitle: string,
    milestoneTitle: string,
    milestoneDescription: string | undefined | null,
    dueDate: Date,
    projectId: string
  ): Promise<boolean> {
    try {
      const projectLink = `${APP_URL}/project/${projectId}`;
      const formattedDate = new Date(dueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const htmlContent = generateMilestoneCreatedTemplate(
        clientName,
        projectTitle,
        milestoneTitle,
        milestoneDescription,
        formattedDate,
        projectLink
      );

      const info = await transporter.sendMail({
        from: `"${COMPANY_NAME}" <${COMPANY_EMAIL}>`,
        to: clientEmail,
        subject: `New Milestone in "${projectTitle}" - ${COMPANY_NAME}`,
        html: htmlContent,
      });

      console.log("✅ Milestone created email sent to:", clientEmail, "Message ID:", info.messageId);
      return true;
    } catch (error) {
      console.error("❌ Failed to send milestone created email:", error);
      return false;
    }
  }

  /**
   * Send milestone due reminder email
   */
  export async function sendMilestoneDueReminderEmail(
    email: string,
    name: string,
    projectTitle: string,
    milestoneTitle: string,
    dueDate: Date,
    projectId: string
  ): Promise<boolean> {
    try {
      const projectLink = `${APP_URL}/project/${projectId}`;
      const formattedDate = new Date(dueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const htmlContent = generateMilestoneDueReminderTemplate(
        name,
        projectTitle,
        milestoneTitle,
        formattedDate,
        projectLink
      );

      const info = await transporter.sendMail({
        from: `"${COMPANY_NAME}" <${COMPANY_EMAIL}>`,
        to: email,
        subject: `Reminder: "${milestoneTitle}" due on ${formattedDate}`,
        html: htmlContent,
      });

      console.log("✅ Milestone due reminder email sent to:", email, "Message ID:", info.messageId);
      return true;
    } catch (error) {
      console.error("❌ Failed to send milestone reminder email:", error);
      return false;
    }
  }

  /**
   * Send milestone completed notification email
   */
  export async function sendMilestoneCompletedEmail(
    email: string,
    name: string,
    projectTitle: string,
    milestoneTitle: string,
    projectId: string
  ): Promise<boolean> {
    try {
      const projectLink = `${APP_URL}/project/${projectId}`;
      const htmlContent = generateMilestoneCompletedTemplate(
        name,
        projectTitle,
        milestoneTitle,
        projectLink
      );

      const info = await transporter.sendMail({
        from: `"${COMPANY_NAME}" <${COMPANY_EMAIL}>`,
        to: email,
        subject: `✅ Milestone Completed: "${milestoneTitle}"`,
        html: htmlContent,
      });

      console.log("✅ Milestone completed email sent to:", email, "Message ID:", info.messageId);
      return true;
    } catch (error) {
      console.error("❌ Failed to send milestone completed email:", error);
      return false;
    }
  }

  /**
   * Send project created notification email
   */
  export async function sendProjectCreatedEmail(
    email: string,
    name: string,
    projectTitle: string,
    projectDescription: string | undefined | null,
    partnerName: string,
    projectId: string
  ): Promise<boolean> {
    try {
      const projectLink = `${APP_URL}/project/${projectId}`;
      const htmlContent = generateProjectCreatedTemplate(
        name,
        projectTitle,
        projectDescription,
        partnerName,
        projectLink
      );

      const info = await transporter.sendMail({
        from: `"${COMPANY_NAME}" <${COMPANY_EMAIL}>`,
        to: email,
        subject: `New Project Created: "${projectTitle}" - ${COMPANY_NAME}`,
        html: htmlContent,
      });

      console.log("✅ Project created email sent to:", email, "Message ID:", info.messageId);
      return true;
    } catch (error) {
      console.error("❌ Failed to send project created email:", error);
      return false;
    }
  }

  /**
   * Send project completed notification email
   */
  export async function sendProjectCompletedEmail(
    email: string,
    name: string,
    projectTitle: string,
    projectId: string
  ): Promise<boolean> {
    try {
      const projectLink = `${APP_URL}/project/${projectId}`;
      const htmlContent = generateProjectCompletedTemplate(
        name,
        projectTitle,
        projectLink
      );

      const info = await transporter.sendMail({
        from: `"${COMPANY_NAME}" <${COMPANY_EMAIL}>`,
        to: email,
        subject: `✅ Project Completed: "${projectTitle}"`,
        html: htmlContent,
      });

      console.log("✅ Project completed email sent to:", email, "Message ID:", info.messageId);
      return true;
    } catch (error) {
      console.error("❌ Failed to send project completed email:", error);
      return false;
    }
  }

  // Email template generators for milestones and projects

  function generateMilestoneCreatedTemplate(
    clientName: string,
    projectTitle: string,
    milestoneTitle: string,
    description: string | undefined | null,
    dueDate: string,
    projectLink: string
  ): string {
    return applyBrandedEmailTheme(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .content { padding: 40px; }
          .milestone-box { background-color: #f9f9f9; border-left: 4px solid #f093fb; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .milestone-title { font-size: 18px; font-weight: 600; color: #333; margin: 0 0 10px 0; }
          .milestone-detail { font-size: 14px; color: #666; margin: 5px 0; }
          .button-container { text-align: center; margin: 30px 0; }
          .button { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; text-decoration: none; padding: 12px 40px; border-radius: 5px; display: inline-block; font-weight: 600; }
          .footer { background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 New Milestone Created</h1>
          </div>
          <div class="content">
            <p>Hi ${clientName},</p>
            <p>A new milestone has been added to your project <strong>"${projectTitle}"</strong>:</p>
            <div class="milestone-box">
              <p class="milestone-title">${milestoneTitle}</p>
              ${description ? `<p class="milestone-detail">${description}</p>` : ""}
              <p class="milestone-detail"><strong>Due Date:</strong> ${dueDate}</p>
            </div>
            <p>Track the progress and stay updated on your project timeline.</p>
            <div class="button-container">
              <a href="${projectLink}" class="button">View Project</a>
            </div>
          </div>
          <div class="footer">
            <p><strong>${COMPANY_NAME}</strong></p>
            <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  function generateMilestoneDueReminderTemplate(
    name: string,
    projectTitle: string,
    milestoneTitle: string,
    dueDate: string,
    projectLink: string
  ): string {
    return applyBrandedEmailTheme(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #ffc107 0%, #ff9f1c 100%); color: #333; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .content { padding: 40px; }
          .reminder-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .button-container { text-align: center; margin: 30px 0; }
          .button { background: linear-gradient(135deg, #ffc107 0%, #ff9f1c 100%); color: #333; text-decoration: none; padding: 12px 40px; border-radius: 5px; display: inline-block; font-weight: 600; }
          .footer { background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Milestone Due Reminder</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>This is a friendly reminder that a milestone is coming up!</p>
            <div class="reminder-box">
              <p><strong>Milestone:</strong> ${milestoneTitle}</p>
              <p><strong>Project:</strong> ${projectTitle}</p>
              <p><strong>Due Date:</strong> ${dueDate}</p>
            </div>
            <p>Make sure to stay on track and complete this milestone on time.</p>
            <div class="button-container">
              <a href="${projectLink}" class="button">Check Progress</a>
            </div>
          </div>
          <div class="footer">
            <p><strong>${COMPANY_NAME}</strong></p>
            <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  function generateMilestoneCompletedTemplate(
    name: string,
    projectTitle: string,
    milestoneTitle: string,
    projectLink: string
  ): string {
    return applyBrandedEmailTheme(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .content { padding: 40px; }
          .success-box { background-color: #f0fdf4; border-left: 4px solid #38ef7d; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .button-container { text-align: center; margin: 30px 0; }
          .button { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; text-decoration: none; padding: 12px 40px; border-radius: 5px; display: inline-block; font-weight: 600; }
          .footer { background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Milestone Completed!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Great news! A milestone has been marked as complete:</p>
            <div class="success-box">
              <p><strong>Milestone:</strong> ${milestoneTitle}</p>
              <p><strong>Project:</strong> ${projectTitle}</p>
            </div>
            <p>Keep up the excellent work on your construction project!</p>
            <div class="button-container">
              <a href="${projectLink}" class="button">View Project</a>
            </div>
          </div>
          <div class="footer">
            <p><strong>${COMPANY_NAME}</strong></p>
            <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  function generateProjectCreatedTemplate(
    name: string,
    projectTitle: string,
    description: string | undefined | null,
    partnerName: string,
    projectLink: string
  ): string {
    return applyBrandedEmailTheme(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .content { padding: 40px; }
          .project-box { background-color: #f0f4ff; border-left: 4px solid #4facfe; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .button-container { text-align: center; margin: 30px 0; }
          .button { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; text-decoration: none; padding: 12px 40px; border-radius: 5px; display: inline-block; font-weight: 600; }
          .footer { background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Project Created!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Your new construction project has been created and is ready to go!</p>
            <div class="project-box">
              <p><strong>Project:</strong> ${projectTitle}</p>
              <p><strong>Partner:</strong> ${partnerName}</p>
              ${description ? `<p><strong>Details:</strong> ${description}</p>` : ""}
            </div>
            <p>Start adding milestones and tracking progress on your journey to project completion.</p>
            <div class="button-container">
              <a href="${projectLink}" class="button">Start Project</a>
            </div>
          </div>
          <div class="footer">
            <p><strong>${COMPANY_NAME}</strong></p>
            <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  function generateProjectCompletedTemplate(
    name: string,
    projectTitle: string,
    projectLink: string
  ): string {
    return applyBrandedEmailTheme(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #fcb045 0%, #fd1d1d 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px; }
          .congrats-box { background-color: #fff3cd; border-left: 4px solid #fcb045; padding: 20px; border-radius: 4px; margin: 20px 0; text-align: center; }
          .button-container { text-align: center; margin: 30px 0; }
          .button { background: linear-gradient(135deg, #fcb045 0%, #fd1d1d 100%); color: white; text-decoration: none; padding: 12px 40px; border-radius: 5px; display: inline-block; font-weight: 600; }
          .footer { background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏆 Project Complete!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <div class="congrats-box">
              <h2 style="margin: 0 0 10px 0; font-size: 20px;">Congratulations!</h2>
              <p style="margin: 0; font-size: 16px; font-weight: 600;">"${projectTitle}" is now complete!</p>
            </div>
            <p>Thank you for using our construction project tracking platform. We hope this project was a success!</p>
            <p>Ready for your next project? We're here to help you manage it smoothly from start to finish.</p>
            <div class="button-container">
              <a href="${projectLink}" class="button">View Completion Report</a>
            </div>
          </div>
          <div class="footer">
            <p><strong>${COMPANY_NAME}</strong></p>
            <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `);
  }
