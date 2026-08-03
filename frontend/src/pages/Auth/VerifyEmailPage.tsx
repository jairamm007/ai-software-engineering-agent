import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Logo from "@/components/common/Logo";
import { LoadingIndicator } from "@/components/LoadingIndicator";

export default function VerifyEmailPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"verifying" | "success" | "error" | "no-token">(() =>
    token ? "verifying" : "no-token"
  );

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    verifyEmail(token)
      .then(() => { if (!cancelled) setStatus("success"); })
      .catch(() => { if (!cancelled) setStatus("error"); });
    return () => { cancelled = true; };
  }, [token, verifyEmail]);

  const icons = {
    verifying: <LoadingIndicator size="lg" />,
    success: (
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
        <Check size={28} className="text-emerald-500" />
      </div>
    ),
    error: (
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15">
        <X size={28} className="text-red-500" />
      </div>
    ),
    "no-token": (
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15">
        <Mail size={28} className="text-amber-500" />
      </div>
    ),
  };

  const titles = {
    verifying: "Verifying your email...",
    success: "Email verified!",
    error: "Verification failed",
    "no-token": "No verification token",
  };

  const descriptions = {
    verifying: "Please wait while we verify your email address.",
    success: "Your email has been verified. You can now use all features.",
    error: "This verification link is invalid or has expired.",
    "no-token": "The verification link is missing a token. Please check your email and try again.",
  };

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
        <div className="mx-auto mb-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
            <Logo size="md" />
          </div>
        </div>

        <div className="flex justify-center">{icons[status]}</div>

        <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{titles[status]}</h2>
        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{descriptions[status]}</p>

        <div className="space-y-3 pt-2">
          {(status === "success") && (
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl accent-gradient px-6 py-2.5 text-sm font-medium text-white accent-shadow transition-all hover:shadow-xl"
            >
              Go to Dashboard
            </Link>
          )}
          {(status === "error" || status === "no-token") && (
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl accent-gradient px-6 py-2.5 text-sm font-medium text-white accent-shadow transition-all hover:shadow-xl"
            >
              Back to Sign In
            </Link>
          )}
          {status === "verifying" && (
            <Link
              to="/login"
              className={`block text-sm font-medium transition-colors ${
                isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Back to sign in
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}
