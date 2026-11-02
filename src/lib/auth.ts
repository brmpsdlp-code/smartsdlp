import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { buildEmailTemplate, escapeHtml, sendMail } from "@/lib/mailer";

const normalizeOrigin = (value: string) => value.replace(/\/$/, "");

function getConfiguredOrigin() {
  const value = process.env.BETTER_AUTH_URL;
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error("BETTER_AUTH_URL is required in production");
  }
  return normalizeOrigin(value || "http://localhost:3000");
}

const configuredOrigin = getConfiguredOrigin();

export const auth = betterAuth({
  baseURL: configuredOrigin,
  trustedOrigins:
    process.env.NODE_ENV === "production"
      ? [configuredOrigin]
      : [configuredOrigin, "http://localhost:3000", "http://127.0.0.1:3000"],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    expiresIn: 60 * 60 * 12,
    updateAge: 60 * 60,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
  databaseHooks: {
    session: {
      create: {
        async before(session) {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { isActive: true },
          });
          return user?.isActive === true;
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    async sendResetPassword({ user, url }) {
      await sendMail({
        to: user.email,
        subject: "Reset Password ? SMART BRMP SDLP",
        html: buildEmailTemplate("Permintaan Reset Password", `<p>Halo <strong>${escapeHtml(user.name || "")}</strong>,</p><p>Kami menerima permintaan untuk mereset password akun SMART Anda. Link berlaku selama <strong>1 jam</strong>.</p>`, { label: "Reset Password", url }),
        text: `Halo ${user.name || ""}, gunakan link berikut untuk mereset password: ${url}`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: false,
    async sendVerificationEmail({ user, url }) {
      await sendMail({
        to: user.email,
        subject: "Verifikasi Email ? SMART BRMP SDLP",
        html: buildEmailTemplate("Verifikasi Email Anda", `<p>Halo <strong>${escapeHtml(user.name || "")}</strong>,</p><p>Terima kasih telah bergabung. Verifikasi email Anda untuk mengaktifkan akun.</p>`, { label: "Verifikasi Email", url }),
        text: `Halo ${user.name || ""}, verifikasi email Anda: ${url}`,
      });
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false,
      },
      nip: {
        type: "string",
        required: false,
        input: true,
      },
      jabatan: {
        type: "string",
        required: false,
        input: true,
      },
      unitKerja: {
        type: "string",
        required: false,
        input: true,
      },
      mustChangePassword: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  advanced: {
    cookiePrefix: "brmp-sdlp",
  },
});

export type Session = typeof auth.$Infer.Session;

