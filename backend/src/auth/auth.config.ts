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
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      suspended: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      bio: {
        type: "string",
        required: false,
      },
      bannerUrl: {
        type: "string",
        required: false,
      },
      linkedinUrl: {
        type: "string",
        required: false,
      },
      githubUrl: {
        type: "string",
        required: false,
      },
      portfolioUrl: {
        type: "string",
        required: false,
      },
    },
  },
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
    requireEmailVerification: true,
    sendResetPassword: async ({ user, token }) => {
      await sendPasswordResetEmail(user.email, token);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      await sendVerificationEmail(user.email, token);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectURI: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/auth/callback/google`,
      mapProfileToUser: (profile) => ({
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      }),
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      redirectURI: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/auth/callback/github`,
      mapProfileToUser: (profile) => ({
        name: profile.name || profile.login,
        email: profile.email,
        image: profile.avatar_url,
      }),
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
