import nodemailer from "nodemailer";
import path from "node:path";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  requireTLS: process.env.SMTP_SECURE !== "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
});

export function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character] ?? character);
}

export interface EmailCta { label: string; url: string }
export interface SendMailOptions { to: string | string[]; subject: string; html?: string; text?: string; from?: string }

export function buildEmailTemplate(title: string, bodyHtml: string, cta?: EmailCta) {
  const button = cta ? `<p style="margin:28px 0;text-align:center;"><a href="${escapeHtml(cta.url)}" style="display:inline-block;background:#143D32;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;">${escapeHtml(cta.label)}</a></p>` : "";
  return `<div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 2px 8px rgba(15,23,42,.08);font-family:Arial,sans-serif;color:#374151;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#143D32;border-radius:12px 12px 0 0;"><tr><td style="padding:14px 4px 14px 16px;width:36px;"><img src="cid:kementan-logo" alt="Logo Kementerian Pertanian" width="32" height="32" style="display:block;"></td><td style="padding:14px 16px 14px 4px;"><div style="line-height:1.1;white-space:nowrap;"><span style="font-size:16px;font-weight:900;letter-spacing:-.02em;color:#fff;">SMART -</span><span style="margin-left:6px;font-size:11px;font-weight:700;color:#6ee7b7;">BRMP SDLP</span></div><div style="margin-top:3px;font-size:9.5px;line-height:1.1;color:#a7f3d0;">Kementerian Pertanian RI</div></td></tr></table><div style="padding:28px 24px;line-height:1.6;"><h1 style="margin:0 0 18px;color:#143D32;font-size:22px;">${title}</h1>${bodyHtml}${button}</div><div style="padding:18px 24px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;line-height:1.5;"><p style="margin:0;">© 2026 SMART BRMP SDLP — Kementerian Pertanian RI</p><p style="margin:4px 0 0;">Email ini dikirim otomatis, mohon tidak membalas.</p></div></div>`;
}

export async function sendMail({ to, subject, html, text, from = process.env.SMTP_FROM || `"Support" <${process.env.SMTP_USER}>` }: SendMailOptions) {
  try {
    const info = await transporter.sendMail({ from, to, subject, text, html, attachments: [{ filename: "logo-kementan.png", path: path.join(process.cwd(), "public/logo-kementan.png"), cid: "kementan-logo" }] });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Gagal mengirim email:", error);
    return { success: false, error };
  }
}

export async function verifySmtpConnection() {
  try { await transporter.verify(); console.log("Koneksi SMTP berhasil diverifikasi."); return true; }
  catch (error) { console.error("Koneksi SMTP gagal:", error); return false; }
}
