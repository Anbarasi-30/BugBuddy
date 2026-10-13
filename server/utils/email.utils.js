/**
 * Email Utility
 * 
 * Configures Nodemailer to send transactional emails (e.g. OTP verification).
 * Reads SMTP credentials from environment variables.
 * Falls back gracefully in development mode if SMTP credentials are missing or failing.
 */

const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  }
  return transporter;
}

/**
 * Send 6-digit OTP verification code to target email
 */
async function sendOtpEmail(toEmail, otpCode) {
  const mailTransporter = getTransporter();
  const fromEmail = process.env.SMTP_FROM || 'no-reply@bugbuddy.app';

  const subject = `${otpCode} is your BugBuddy Verification Code`;
  const textContent = `Welcome to BugBuddy!\n\nYour 6-digit verification code is: ${otpCode}\n\nThis code will expire in 5 minutes. If you did not request this code, please ignore this email.`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #334155; border-radius: 8px; background-color: #0f172a; color: #f8fafc;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #6366f1; margin: 0; font-size: 24px;">BugBuddy</h1>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Find the Bug. Build the Skill.</p>
      </div>
      <div style="background-color: #1e293b; padding: 20px; border-radius: 6px; text-align: center;">
        <p style="font-size: 16px; margin-bottom: 12px; color: #cbd5e1;">Your Email Verification Code:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #38bdf8; background-color: #0f172a; padding: 12px; border-radius: 4px; display: inline-block;">
          ${otpCode}
        </div>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 12px;">This code will expire in <strong>5 minutes</strong>.</p>
      </div>
      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 20px;">
        If you did not request this email, you can safely ignore it.
      </p>
    </div>
  `;

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: `"BugBuddy Auth" <${fromEmail}>`,
        to: toEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });
      console.log(`[Email Service] Sent verification OTP to ${toEmail}`);
      return { success: true, delivered: true };
    } catch (err) {
      console.error(`[Email Service Error] Failed to send email via SMTP to ${toEmail}:`, err.message);
      console.log(`[Email Service Dev Fallback] OTP for ${toEmail}: ${otpCode}`);
      return { success: true, delivered: false, fallbackOtp: otpCode };
    }
  } else {
    console.log(`[Email Service Dev Mode] No SMTP configured in .env. OTP for ${toEmail}: ${otpCode}`);
    return { success: true, delivered: false, fallbackOtp: otpCode };
  }
}

module.exports = { sendOtpEmail };
