import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../database/prisma.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/email/email.service.js";

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [frontendUrl],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // refresh every 24h
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.NODE_ENV === "production",
    sendResetPassword: async ({ user, token }) => {
      await sendPasswordResetEmail(user.email, token);
    },
  },
  emailVerification: {
    sendOnSignUp: process.env.NODE_ENV === "production",
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      await sendVerificationEmail(user.email, token);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
  advanced: {
    cookiePrefix: "asea",
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      // In development, frontend (port 5173) and backend (port 3000) are on different ports.
      // Setting domain to "localhost" makes session cookies work across both ports.
      ...(process.env.NODE_ENV !== "production" ? { domain: "localhost" } : {}),
    },
    crossSubDomainCookies: {
      enabled: false,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
