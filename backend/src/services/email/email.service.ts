import { Resend } from "resend";

const isDev = process.env.NODE_ENV !== "production";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || "AI Software Engineering Agent / Repo Verify <onboarding@resend.dev>";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

if (isDev && /@resend\.dev/i.test(FROM_EMAIL)) {
  console.warn(
    "[EMAIL] You are using Resend's test sender (" + FROM_EMAIL + "). " +
    "Resend only delivers these emails to the email address used to create your Resend account. " +
    "To send to any recipient, verify a domain at https://resend.com/domains and update EMAIL_FROM " +
    "to use an address on that domain."
  );
}

async function deliverEmail(message: Parameters<Resend["emails"]["send"]>[0]) {
  if (!resend) {
    throw new Error("Email delivery is not configured. Set RESEND_API_KEY to send emails.");
  }

  const { error } = await resend.emails.send(message);
  if (error) {
    console.error("[EMAIL] Resend delivery failed:", error);
    throw new Error(`Unable to deliver email: ${error.message}`);
  }
}

function logEmailToConsole(kind: string, email: string, link: string) {
  console.log("");
  console.log("========================================");
  console.log(`[EMAIL] ${kind} email (dev mode)`);
  console.log(`[EMAIL] To: ${email}`);
  console.log(`[EMAIL] Link: ${link}`);
  console.log("========================================");
  console.log("");
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  if (isDev) {
    logEmailToConsole("Verification", email, verifyUrl);
  }

  if (!resend) {
    if (!isDev) {
      throw new Error("Email delivery is not configured. Set RESEND_API_KEY to send emails.");
    }
    return;
  }

  try {
    await deliverEmail({
      from: FROM_EMAIL,
      to: email,
      subject: "Verify your email — Repo Verify",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #1e1e2e;">Verify your email address</h2>
          <p style="color: #555; line-height: 1.6;">
            Thanks for signing up for Repo Verify. Click the button below to verify your email address.
          </p>
          <a href="${verifyUrl}"
             style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #d946ef); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
            Verify Email
          </a>
          <p style="color: #999; font-size: 13px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error(`[EMAIL] Verification email failed for ${email}:`, err);
    console.log(`[EMAIL] Verification link (use this manually): ${verifyUrl}`);
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  if (isDev) {
    logEmailToConsole("Password reset", email, resetUrl);
  }

  if (!resend) {
    if (!isDev) {
      throw new Error("Email delivery is not configured. Set RESEND_API_KEY to send emails.");
    }
    return;
  }

  try {
    await deliverEmail({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset your password — Repo Verify",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #1e1e2e;">Reset your password</h2>
          <p style="color: #555; line-height: 1.6;">
            We received a request to reset your password. Click the button below to choose a new one.
          </p>
          <a href="${resetUrl}"
             style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #d946ef); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #999; font-size: 13px;">
            If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error(`[EMAIL] Password reset email failed for ${email}:`, err);
    console.log(`[EMAIL] Password reset link (use this manually): ${resetUrl}`);
  }
}
