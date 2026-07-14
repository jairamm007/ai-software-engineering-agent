import type { User, LoginCredentials, RegisterData } from "@/types/auth";
import {
  signIn,
  signUp,
  signOut,
  getSession,
  requestPasswordReset,
  resetPassword as baResetPassword,
} from "@/lib/auth-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const FRONTEND_URL = window.location.origin;

function mapUser(data: Record<string, unknown>): User {
  return {
    id: data.id as string,
    name: data.name as string,
    email: data.email as string,
    image: data.image as string | undefined,
    emailVerified: data.emailVerified as boolean,
    createdAt: (data.createdAt as string) ?? new Date().toISOString(),
  };
}

export async function apiLogin(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
  const { data, error } = await signIn.email({
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
  const { data: result, error } = await signUp.email({
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
  const { data, error } = await signIn.social({
    provider: "google",
    callbackURL: `${FRONTEND_URL}/dashboard`,
  });

  if (error) {
    throw new Error(error.message || "Google sign-in failed");
  }

  // Better Auth returns a redirect URL for social providers — navigate to it
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
  const { data, error } = await signIn.social({
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
    const { data } = await getSession();

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
  await signOut();
}

export async function apiForgotPassword(email: string): Promise<void> {
  const { error } = await requestPasswordReset({
    email,
    redirectTo: `${FRONTEND_URL}/reset-password`,
  });

  if (error) {
    throw new Error(error.message || "Failed to send reset email");
  }
}

export async function apiResetPassword(token: string, newPassword: string): Promise<void> {
  const { error } = await baResetPassword({
    token,
    newPassword,
  });

  if (error) {
    throw new Error(error.message || "Failed to reset password");
  }
}

export async function apiVerifyEmail(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/verify-email`, {
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
  const res = await fetch(`${API_URL}/api/user/account`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || "Failed to delete account");
  }
}

export async function apiChangePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/user/change-password`, {
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
  const res = await fetch(`${API_URL}/api/user/export`, {
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
  const res = await fetch(`${API_URL}/api/user/clear-cache`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || "Failed to clear cache");
  }
}
