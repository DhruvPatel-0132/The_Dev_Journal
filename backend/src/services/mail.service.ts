import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";
import dns from "dns";

// Force Node.js to prefer IPv4 over IPv6 to fix ENETUNREACH errors on environments like Render
dns.setDefaultResultOrder("ipv4first");

dotenv.config();

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

const createTransporter = async () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  // Always fetch a fresh access token so it never goes stale
  const accessTokenObj = await oauth2Client.getAccessToken();
  const accessToken = accessTokenObj?.token;

  if (!accessToken) {
    throw new Error("Failed to obtain OAuth2 access token for email service");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.SENDER_EMAIL,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken,
    },
  });
};

export const sendMail = async ({ to, subject, html }: SendMailOptions) => {
  try {
    const mailTransporter = await createTransporter();
    const info = await mailTransporter.sendMail({
      from: `"${process.env.FROM_NAME || "The Dev Journal"}" <${process.env.FROM_EMAIL || process.env.SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Could not send email");
  }
};

export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
  const subject = "Password Reset Request";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #4CAF50;">Password Reset</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
      <p>To reset your password, click the button below:</p>
      <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #4CAF50; text-decoration: none; border-radius: 5px; margin-top: 10px;">Reset Password</a>
      <p style="margin-top: 20px;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>Best regards,<br/>The Dev Journal Team</p>
    </div>
  `;

  return sendMail({ to, subject, html });
};

export const sendVerificationOTPEmail = async (to: string, otp: string) => {
  const subject = "Verify Your Email — The Dev Journal";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0f0f0f; color: #e4e4e7; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #818cf8; font-size: 22px; margin: 0;">The Dev Journal</h2>
        <p style="color: #71717a; font-size: 13px; margin: 4px 0 0;">Engineering Blog Platform</p>
      </div>

      <h3 style="font-size: 18px; font-weight: 600; color: #f4f4f5; margin-bottom: 8px;">Verify your email address</h3>
      <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        Use the code below to verify your email. This code expires in <strong style="color: #f4f4f5;">10 minutes</strong>.
      </p>

      <div style="text-align: center; background: #1c1c1e; border: 1px solid #3f3f46; border-radius: 12px; padding: 28px 16px; margin-bottom: 24px;">
        <span style="font-size: 42px; font-weight: 700; letter-spacing: 14px; color: #818cf8; font-family: 'Courier New', monospace;">${otp}</span>
      </div>

      <p style="color: #71717a; font-size: 12px; text-align: center; line-height: 1.6;">
        If you didn't create an account on The Dev Journal, you can safely ignore this email.
      </p>

      <hr style="border: none; border-top: 1px solid #27272a; margin: 24px 0;" />
      <p style="color: #52525b; font-size: 11px; text-align: center; margin: 0;">
        © ${new Date().getFullYear()} The Dev Journal Team
      </p>
    </div>
  `;

  return sendMail({ to, subject, html });
};