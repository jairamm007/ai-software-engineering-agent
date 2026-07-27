import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
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
  apiUpdateProfile,
  apiUploadBanner,
  apiRemoveBanner,
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
    return result.user;
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

  const loginWithGoogle = useCallback(async (callbackURL?: string) => {
    const result = await apiLoginWithGoogle(callbackURL);
    setUser(result.user);
    setToken(result.token);
  }, []);

  const loginWithGithub = useCallback(async (callbackURL?: string) => {
    const result = await apiLoginWithGithub(callbackURL);
    setUser(result.user);
    setToken(result.token);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Pick<User, "name" | "email" | "bio" | "role" | "image" | "bannerUrl" | "linkedinUrl" | "githubUrl" | "portfolioUrl">>) => {
    // Optimistic update
    setUser((prev) => (prev ? { ...prev, ...updates } : null));

    try {
      const updated = await apiUpdateProfile(updates);
      setUser(updated);
    } catch {
      // Revert on failure — refetch from server
      const session = await apiGetSession();
      if (session) setUser(session.user);
    }
  }, []);

  const uploadBanner = useCallback(async (bannerDataUrl: string) => {
    const url = await apiUploadBanner(bannerDataUrl);
    setUser((prev) => (prev ? { ...prev, bannerUrl: url } : null));
  }, []);

  const removeBanner = useCallback(async () => {
    await apiRemoveBanner();
    setUser((prev) => (prev ? { ...prev, bannerUrl: undefined } : null));
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

  const value = useMemo(() => ({
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
    uploadBanner,
    removeBanner,
    deleteAccount,
    changePassword,
  }), [user, token, isLoading, login, register, logout, forgotPassword, resetPassword, verifyEmail, loginWithGoogle, loginWithGithub, updateProfile, uploadBanner, removeBanner, deleteAccount, changePassword]);

  return (
    <AuthContext.Provider value={value}>
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
