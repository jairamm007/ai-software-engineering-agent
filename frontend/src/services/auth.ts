import type { User, LoginCredentials, RegisterData } from "@/types/auth";
import { authClient } from "@/lib/auth-client";

const FRONTEND_URL = window.location.origin;
const BACKEND_URL = import.meta.env.VITE_API_URL || "";

function mapUser(data: Record<string, unknown>): User {
  const emailVerifiedRaw = data.emailVerified;
  const emailVerified = emailVerifiedRaw instanceof Date
    ? emailVerifiedRaw.getTime() > 0
    : Boolean(emailVerifiedRaw);

  return {
    id: data.id as string,
    name: data.name as string,
    email: data.email as string,
    image: data.image as string | undefined,
    bannerUrl: data.bannerUrl as string | undefined,
    role: data.role as string | undefined,
    bio: data.bio as string | undefined,
    linkedinUrl: data.linkedinUrl as string | undefined,
    githubUrl: data.githubUrl as string | undefined,
    portfolioUrl: data.portfolioUrl as string | undefined,
    emailVerified,
    createdAt: (data.createdAt as string) ?? new Date().toISOString(),
  };
}

export async function apiLogin(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
  const { data, error } = await authClient.signIn.email({
    email: credentials.email,
    password: credentials.password,
    rememberMe: credentials.rememberMe ?? false,
  });

  if (error) {
    const message = (error as { message?: string; error?: { message?: string } }).message
      || (error as { error?: { message?: string } }).error?.message
      || "Invalid email or password";
    throw new Error(message);
  }

  if (!data?.user) {
    throw new Error("Login failed — no user data returned");
  }

  return {
    user: mapUser(data.user as Record<string, unknown>),
    token: (data as { token?: string }).token ?? "",
  };
}

export async function apiRegister(data: RegisterData): Promise<{ user: User; token: string }> {
  const { data: result, error } = await authClient.signUp.email({
    name: data.name,
    email: data.email,
    password: data.password,
  });

  if (error) {
    const message = (error as { message?: string; error?: { message?: string } }).message
      || (error as { error?: { message?: string } }).error?.message
      || "Registration failed";
    throw new Error(message);
  }

  if (!result?.user) {
    throw new Error("Registration failed — no user data returned");
  }

  return {
    user: mapUser(result.user as Record<string, unknown>),
    token: (result as { token?: string }).token ?? "",
  };
}

export async function apiLoginWithGoogle(callbackURL?: string): Promise<{ user: User; token: string }> {
  const { data, error } = await authClient.signIn.social({
    provider: "google",
    callbackURL: callbackURL || `${FRONTEND_URL}/dashboard`,
  });

  if (error) {
    const message = (error as { message?: string; error?: { message?: string } }).message
      || (error as { error?: { message?: string } }).error?.message
      || "Google sign-in failed";
    throw new Error(message);
  }

  if (data?.url) {
    window.location.href = data.url;
    return new Promise<never>(() => {});
  }

  throw new Error("Google sign-in failed: no redirect URL received");
}

export async function apiLoginWithGithub(callbackURL?: string): Promise<{ user: User; token: string }> {
  const { data, error } = await authClient.signIn.social({
    provider: "github",
    callbackURL: callbackURL || `${FRONTEND_URL}/dashboard`,
  });

  if (error) {
    const message = (error as { message?: string; error?: { message?: string } }).message
      || (error as { error?: { message?: string } }).error?.message
      || "GitHub sign-in failed";
    throw new Error(message);
  }

  if (data?.url) {
    window.location.href = data.url;
    return new Promise<never>(() => {});
  }

  throw new Error("GitHub sign-in failed: no redirect URL received");
}

export async function apiGetSession(): Promise<{ user: User; token: string } | null> {
  try {
    const { data, error } = await authClient.getSession();

    if (error || !data?.session || !data.user) return null;

    return {
      user: mapUser(data.user as Record<string, unknown>),
      token: (data.session as { token?: string }).token ?? "",
    };
  } catch {
    return null;
  }
}

export async function apiLogout(): Promise<void> {
  await authClient.signOut();
}

export async function apiForgotPassword(email: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/api/auth/forget-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      redirectTo: `${FRONTEND_URL}/reset-password`,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { message?: string; error?: string }).message
      || (body as { error?: string }).error
      || "Failed to send reset email";
    throw new Error(message);
  }
}

export async function apiResetPassword(token: string, newPassword: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { message?: string; error?: string }).message
      || (body as { error?: string }).error
      || "Failed to reset password";
    throw new Error(message);
  }
}

export async function apiVerifyEmail(token: string): Promise<void> {
  const url = new URL(`${BACKEND_URL}/api/auth/verify-email`);
  url.searchParams.set("token", token);

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { message?: string; error?: string }).message
      || (body as { error?: string }).error
      || "Verification failed";
    throw new Error(message);
  }
}

export async function apiResendVerificationEmail(email: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/api/auth/send-verification-email`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      callbackURL: `${window.location.origin}/verify-email`,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { message?: string; error?: string }).message
      || (body as { error?: string }).error
      || "Failed to resend verification email";
    throw new Error(message);
  }
}

export async function apiDeleteAccount(): Promise<void> {
    const res = await fetch(`${BACKEND_URL}/api/user/account`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || "Failed to delete account");
  }
}

export async function apiChangePassword(currentPassword: string, newPassword: string): Promise<void> {
    const res = await fetch(`${BACKEND_URL}/api/user/change-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || "Failed to change password");
  }
}

export async function apiExportData(): Promise<Record<string, unknown>> {
    const res = await fetch(`${BACKEND_URL}/api/user/export`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || "Failed to export data");
  }

  const json = await res.json();
  return json.data;
}

export async function apiClearCache(): Promise<void> {
    const res = await fetch(`${BACKEND_URL}/api/user/clear-cache`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || "Failed to clear cache");
  }
}

export async function apiUpdateProfile(updates: Partial<Pick<User, "name" | "email" | "bio" | "image" | "bannerUrl" | "linkedinUrl" | "githubUrl" | "portfolioUrl">>): Promise<User> {
  const res = await fetch(`${BACKEND_URL}/api/user/profile`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || "Failed to update profile");
  }

  const json = await res.json();
  return mapUser(json.user as Record<string, unknown>);
}

export async function apiUploadBanner(bannerUrl: string): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/api/user/banner`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bannerUrl }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || "Failed to upload banner");
  }

  const json = await res.json();
  return json.bannerUrl;
}

export async function apiRemoveBanner(): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/api/user/banner`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || "Failed to remove banner");
  }
}
