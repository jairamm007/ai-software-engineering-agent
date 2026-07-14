import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { User, AuthContextValue, LoginCredentials, RegisterData } from "@/types/auth";
import {
  apiLogin,
  apiRegister,
  apiLoginWithGoogle,
  apiLoginWithGithub,
  apiForgotPassword,
  apiResetPassword,
  apiVerifyEmail,
  apiGetSession,
  apiLogout,
  apiDeleteAccount,
  apiChangePassword,
} from "@/services/auth";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiGetSession()
      .then((session) => {
        if (!cancelled && session) {
          setUser(session.user);
          setToken(session.token);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await apiLogin(credentials);
    setUser(result.user);
    setToken(result.token);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const result = await apiRegister(data);
    setUser(result.user);
    setToken(result.token);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setToken(null);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await apiForgotPassword(email);
  }, []);

  const resetPassword = useCallback(async (resetToken: string, newPassword: string) => {
    await apiResetPassword(resetToken, newPassword);
  }, []);

  const verifyEmail = useCallback(async (verifyToken: string) => {
    await apiVerifyEmail(verifyToken);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const result = await apiLoginWithGoogle();
    setUser(result.user);
    setToken(result.token);
  }, []);

  const loginWithGithub = useCallback(async () => {
    const result = await apiLoginWithGithub();
    setUser(result.user);
    setToken(result.token);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Pick<User, "name" | "email" | "bio" | "role" | "image">>) => {
    // Update locally for instant UI feedback
    setUser((prev) => (prev ? { ...prev, ...updates } : null));

    // TODO: Call backend profile update endpoint when available
  }, []);

  const deleteAccount = useCallback(async () => {
    await apiDeleteAccount();
    // User and session are already deleted server-side — just clear local state
    setUser(null);
    setToken(null);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await apiChangePassword(currentPassword, newPassword);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        verifyEmail,
        loginWithGoogle,
        loginWithGithub,
        updateProfile,
        deleteAccount,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
