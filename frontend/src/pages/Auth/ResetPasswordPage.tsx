import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Sparkles, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function ResetPasswordPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!token) setExpired(true);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token || "", password);
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (expired && !success) {
    return (
      <div className={`flex min-h-screen items-center justify-center px-6 transition-colors duration-300 ${
        isDark ? "bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950" : "bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50"
      }`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-md space-y-6 rounded-2xl border p-8 text-center shadow-sm ${
            isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
          }`}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15">
            <Lock size={28} className="text-red-500" />
          </div>
          <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Link expired</h2>
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl"
          >
            Request new link
          </Link>
          <Link
            to="/login"
            className={`block text-sm font-medium transition-colors ${
              isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Back to sign in
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen items-center justify-center px-6 transition-colors duration-300 ${
      isDark ? "bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950" : "bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50"
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md space-y-6 rounded-2xl border p-8 shadow-sm ${
          isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
        }`}
      >
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600">
            <Sparkles size={22} className="text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            {success ? "Password updated!" : "Set new password"}
          </h2>
          <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {success
              ? "Your password has been reset. Redirecting to sign in..."
              : "Enter your new password below"
            }
          </p>
        </div>

        {success ? (
          <div className="flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
              <Check size={28} className="text-emerald-500" />
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div>
                <label className={`mb-1.5 block text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>New Password</label>
                <div className="relative">
                  <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className={`w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm outline-none transition-colors ${
                      isDark
                        ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-violet-500"
                        : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`mb-1.5 block text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors ${
                      isDark
                        ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-violet-500"
                        : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-500"
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 disabled:opacity-50 disabled:shadow-none"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </>
        )}

        <Link
          to="/login"
          className={`block text-center text-sm font-medium transition-colors ${
            isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Back to sign in
        </Link>
      </motion.div>
    </div>
  );
}
