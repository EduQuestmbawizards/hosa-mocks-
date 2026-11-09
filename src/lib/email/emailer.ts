import nodemailer from "nodemailer";
import { createAdminClient } from "@/lib/supabase/admin";

interface SendEmailParams {
  to: string;
  template: "new_signup_admin" | "account_approved_student" | "account_rejected_student" | "report_ready_student";
  data: Record<string, any>;
}

/**
 * Configure Nodemailer SMTP transporter using server environment variables.
 */
function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * HTML Email Templates with EduQuest Branding
 */
function renderEmailTemplate(template: SendEmailParams["template"], data: Record<string, any>) {
  const brandName = "EduQuest Mock Test Portal";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  switch (template) {
    case "new_signup_admin":
      return {
        subject: `[EduQuest Alert] New Student Signup: ${data.fullName} (${data.events?.join(", ") || "Mock Portal"})`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 8px;">
            <div style="background: #0f172a; padding: 20px; border-radius: 6px 6px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">EduQuest Administration</h1>
              <p style="color: #d97706; margin: 4px 0 0 0; font-size: 13px;">Reimagining Education &bull; New Access Request</p>
            </div>
            <div style="background: #ffffff; padding: 28px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 6px 6px;">
              <p style="font-size: 15px; color: #1e293b; margin-top: 0;">Hello Administrator,</p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                A new student has registered on the EduQuest Mock Test Portal and is awaiting your review.
              </p>
              
              <div style="background: #f1f5f9; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #d97706;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr><td style="padding: 6px 0; color: #64748b; width: 120px;">Full Name:</td><td style="font-weight: 600; color: #0f172a;">${data.fullName}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Email:</td><td style="font-weight: 600; color: #0f172a;">${data.email}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Phone:</td><td style="font-weight: 600; color: #0f172a;">${data.phone || "Not provided"}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">City:</td><td style="font-weight: 600; color: #0f172a;">${data.city || "Not provided"}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Events:</td><td style="font-weight: 600; color: #b45309;">${data.events?.join(", ") || "Mock Portal"}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Signup Time:</td><td style="color: #0f172a;">${new Date().toLocaleString()}</td></tr>
                </table>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${appUrl}/admin" style="background: #b45309; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
                  Open Access Requests in Admin Dashboard
                </a>
              </div>

              <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 0;">
                Note: Passwords are encrypted and never shown in emails or logs.
              </p>
            </div>
          </div>
        `,
      };

    case "account_approved_student":
      return {
        subject: `Your EduQuest Account is Approved! 🎓`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 8px;">
            <div style="background: #065f46; padding: 20px; border-radius: 6px 6px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">EduQuest Portal</h1>
              <p style="color: #6ee7b7; margin: 4px 0 0 0; font-size: 13px;">Reimagining Education &bull; Account Accepted</p>
            </div>
            <div style="background: #ffffff; padding: 28px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 6px 6px;">
              <p style="font-size: 16px; color: #0f172a; margin-top: 0; font-weight: 600;">Dear ${data.fullName},</p>
              <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                Great news! Your EduQuest account has been officially accepted by administrator <strong>Rupali</strong>.
              </p>
              <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                You can now attempt <strong>all published mock tests and practice modules</strong>: <strong>${data.events?.join(", ") || "All Tests"}</strong>.
              </p>

              <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 16px; border-radius: 6px; margin: 24px 0;">
                <h4 style="margin: 0 0 8px 0; color: #065f46; font-size: 14px;">What's Unlocked for You:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #047857; font-size: 13px; line-height: 1.6;">
                  <li>Full 50-MCQ 60-Minute Mocks</li>
                  <li>Practice Sets with Instant Explanation & Feedback</li>
                  <li>In-depth Score Analytics, Weak-Topic Diagnoses & A4 Print Reports</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 28px 0;">
                <a href="${appUrl}/dashboard" style="background: #059669; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
                  Log In & Start Practicing
                </a>
              </div>

              <p style="font-size: 13px; color: #64748b;">
                Best regards,<br/>
                <strong>EduQuest Team</strong><br/>
                <a href="mailto:rupali.eduquest@gmail.com" style="color: #0284c7;">rupali.eduquest@gmail.com</a>
              </p>
            </div>
          </div>
        `,
      };

    case "account_rejected_student":
      return {
        subject: `Update regarding your EduQuest registration`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 8px;">
            <div style="background: #1e293b; padding: 20px; border-radius: 6px 6px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">EduQuest Portal</h1>
            </div>
            <div style="background: #ffffff; padding: 28px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 6px 6px;">
              <p style="font-size: 15px; color: #0f172a; margin-top: 0;">Dear ${data.fullName},</p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                Thank you for your interest in the EduQuest Mock Test Portal. At this time, your application for full mock test access could not be approved.
              </p>
              ${
                data.reason
                  ? `<div style="background: #f8fafc; border-left: 4px solid #94a3b8; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #334155;"><strong>Reason:</strong> ${data.reason}</div>`
                  : ""
              }
              <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                You are still welcome to attempt the <strong>Free Mock Test</strong> to practice standard exam conditions.
              </p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                If you believe this was in error or need assistance, please feel free to reach out to us at <a href="mailto:rupali.eduquest@gmail.com" style="color: #0284c7;">rupali.eduquest@gmail.com</a>.
              </p>
              <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
                Warm regards,<br/>
                EduQuest Support
              </p>
            </div>
          </div>
        `,
      };

    case "report_ready_student":
      return {
        subject: `Your EduQuest Mock Test Report is Ready: ${data.testTitle}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 8px;">
            <div style="background: #0f172a; padding: 20px; border-radius: 6px 6px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">EduQuest Test Report</h1>
              <p style="color: #d97706; margin: 4px 0 0 0; font-size: 13px;">${data.testTitle}</p>
            </div>
            <div style="background: #ffffff; padding: 28px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 6px 6px;">
              <p style="font-size: 15px; color: #0f172a; margin-top: 0;">Hello ${data.fullName},</p>
              <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                Your attempt for <strong>${data.testTitle}</strong> has been scored and your full performance report is ready.
              </p>
              <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <div style="font-size: 13px; color: #92400e; text-transform: uppercase; font-weight: 600;">Your Score</div>
                <div style="font-size: 32px; font-weight: 800; color: #b45309; margin: 4px 0;">
                  ${data.score} / ${data.maxScore} <span style="font-size: 18px; font-weight: 500;">(${data.percent}%)</span>
                </div>
              </div>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${appUrl}/reports/${data.attemptId}" style="background: #b45309; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
                  View Detailed Question Analysis & Print PDF
                </a>
              </div>
            </div>
          </div>
        `,
      };
  }
}

/**
 * Main email sender function: dispatches via SMTP and logs result to public.email_log table.
 */
export async function sendEmail({ to, template, data }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const { subject, html } = renderEmailTemplate(template, data);
  const fromName = process.env.SMTP_FROM_NAME || "EduQuest";
  const fromEmail = process.env.SMTP_FROM_EMAIL || "rupali.eduquest@gmail.com";
  const from = `"${fromName}" <${fromEmail}>`;

  let status: "sent" | "failed" = "sent";
  let errorMessage: string | undefined = undefined;

  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn(`[Emailer] SMTP credentials not configured. Simulating email send to ${to} (${template}).`);
      status = "sent";
    } else {
      await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      console.log(`[Emailer] Successfully sent ${template} email to ${to}`);
    }
  } catch (err: any) {
    status = "failed";
    errorMessage = err?.message || "Unknown SMTP error";
    console.error(`[Emailer] Failed to send ${template} email to ${to}:`, errorMessage);
  }

  // Record delivery status to email_log table via Admin Client
  try {
    const supabase = createAdminClient();
    await supabase.from("email_log").insert({
      to_email: to,
      template,
      status,
      error: errorMessage || null,
    });
  } catch (logErr: any) {
    console.error("[Emailer] Failed to write to email_log:", logErr?.message);
  }

  return { success: status === "sent", error: errorMessage };
}
