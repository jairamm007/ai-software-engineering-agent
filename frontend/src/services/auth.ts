import type { User, LoginCredentials, RegisterData } from "@/types/auth";
import { authClient } from "@/lib/auth-client";

const FRONTEND_URL = window.location.origin;
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function mapUser(data: Record<string, unknown>): User {
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
    emailVerified: data.emailVerified as boolean,
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
    throw new Error(error.message || "Invalid email or password");
  }

  if (!data) {
    throw new Error("Login failed");
  }

  return {
    user: mapUser(data.user as Record<string, unknown>),
    token: data.token ?? "",
  };
}

export async function apiRegister(data: RegisterData): Promise<{ user: User; token: string }> {
  const { data: result, error } = await authClient.signUp.email({
    name: data.name,
    email: data.email,
    password: data.password,
  });

  if (error) {
    throw new Error(error.message || "Registration failed");
  }

  if (!result) {
    throw new Error("Registration failed");
  }

  return {
    user: mapUser(result.user as Record<string, unknown>),
    token: result.token ?? "",
  };
}

export async function apiLoginWithGoogle(callbackURL?: string): Promise<{ user: User; token: string }> {
  const { data, error } = await authClient.signIn.social({
    provider: "google",
    callbackURL: callbackURL || `${FRONTEND_URL}/dashboard`,
  });

  if (error) {
    throw new Error(error.message || "Google sign-in failed");
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
    throw new Error(error.message || "GitHub sign-in failed");
  }

  if (data?.url) {
    window.location.href = data.url;
    return new Promise<never>(() => {});
  }

  throw new Error("GitHub sign-in failed: no redirect URL received");
}

export async function apiGetSession(): Promise<{ user: User; token: string } | null> {
  try {
    const { data } = await authClient.getSession();

    if (!data?.session || !data.user) return null;

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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      redirectTo: `${FRONTEND_URL}/reset-password`,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || "Failed to send reset email");
  }
}

export async function apiResetPassword(token: string, newPassword: string): Promise<void> {
  const { error } = await authClient.resetPassword({
    token,
    newPassword,
  });

  if (error) {
    throw new Error(error.message || "Failed to reset password");
  }
}

export async function apiVerifyEmail(token: string): Promise<void> {
    const res = await fetch(`${BACKEND_URL}/api/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || "Verification failed");
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

export async function apiUpdateProfile(updates: Partial<Pick<User, "name" | "email" | "bio" | "role" | "image" | "bannerUrl" | "linkedinUrl" | "githubUrl" | "portfolioUrl">>): Promise<User> {
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
