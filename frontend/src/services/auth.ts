import type { User, LoginCredentials, RegisterData } from "@/types/auth";
import { authClient } from "@/lib/auth-client";

const FRONTEND_URL = window.location.origin;

function mapUser(data: Record<string, unknown>): User {
  return {
    id: data.id as string,
    name: data.name as string,
    email: data.email as string,
    image: data.image as string | undefined,
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

export async function apiLoginWithGoogle(): Promise<{ user: User; token: string }> {
  const { data, error } = await authClient.signIn.social({
    provider: "google",
    callbackURL: `${FRONTEND_URL}/dashboard`,
  });

  if (error) {
    throw new Error(error.message || "Google sign-in failed");
  }

  if (data?.url) {
    window.location.href = data.url;
    return new Promise(() => {});
  }

  const session = await apiGetSession();
  if (!session) {
    throw new Error("Failed to get session after Google sign-in");
  }
  return session;
}

export async function apiLoginWithGithub(): Promise<{ user: User; token: string }> {
  const { data, error } = await authClient.signIn.social({
    provider: "github",
    callbackURL: `${FRONTEND_URL}/dashboard`,
  });

  if (error) {
    throw new Error(error.message || "GitHub sign-in failed");
  }

  if (data?.url) {
    window.location.href = data.url;
    return new Promise(() => {});
  }

  const session = await apiGetSession();
  if (!session) {
    throw new Error("Failed to get session after GitHub sign-in");
  }
  return session;
}

export async function apiGetSession(): Promise<{ user: User; token: string } | null> {
  try {
    const { data } = await authClient.getSession();

    if (!data?.session) return null;

    return {
      user: mapUser(data.user as unknown as Record<string, unknown>),
      token: (data.session as unknown as Record<string, unknown>)?.token as string ?? "",
    };
  } catch {
    return null;
  }
}

export async function apiLogout(): Promise<void> {
  await authClient.signOut();
}

export async function apiForgotPassword(email: string): Promise<void> {
  const res = await fetch("/api/auth/forget-password", {
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
    const res = await fetch("/api/auth/verify-email", {
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
    const res = await fetch("/api/user/account", {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || "Failed to delete account");
  }
}

export async function apiChangePassword(currentPassword: string, newPassword: string): Promise<void> {
    const res = await fetch("/api/user/change-password", {
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
    const res = await fetch("/api/user/export", {
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
    const res = await fetch("/api/user/clear-cache", {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || "Failed to clear cache");
  }
}

export async function apiUpdateProfile(updates: Partial<Pick<User, "name" | "email" | "bio" | "role" | "image" | "linkedinUrl" | "githubUrl" | "portfolioUrl">>): Promise<User> {
  const res = await fetch("/api/user/profile", {
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
