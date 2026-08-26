import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Bot,
  Shield,
  Zap,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Logo from "@/components/common/Logo";
import OrbitingRingsBackground from "@/components/landing/OrbitingRingsBackground";
import { LoadingIndicator } from "@/components/LoadingIndicator";

const features = [
  { icon: Bot, text: "AI-powered code analysis", hex: "139,92,246", featured: true },
  { icon: Zap, text: "Smart repository indexing", hex: "245,166,35" },
  { icon: Shield, text: "Security vulnerability detection", hex: "16,185,129" },
];

export default function LoginPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, loginWithGithub, resendVerificationEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() => {
    const params = new URLSearchParams(location.search);
    const urlError = params.get("error");
    if (urlError) {
      const errorMessages: Record<string, string> = {
        account_not_linked: "An account with this email already exists. Please sign in with your email and password.",
        auth_error: "Authentication failed. Please try again.",
        access_denied: "Access was denied. Please try again.",
      };
      return errorMessages[urlError] || `Authentication error: ${urlError}`;
    }
    return "";
  });
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hoveredOauth, setHoveredOauth] = useState<"google" | "github" | null>(null);

  // Mouse-driven card spotlight + tilt
  const cardRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const springMx = useSpring(mx, { stiffness: 120, damping: 18 });
  const springMy = useSpring(my, { stiffness: 120, damping: 18 });
  const spotlight = useMotionTemplate`radial-gradient(480px circle at ${springMx}% ${springMy}%, ${isDark ? "rgba(139,92,246,0.14)" : "rgba(139,92,246,0.12)"}, transparent 65%)`;
  const rotateX = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResendSent(false);
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login({ email, password, rememberMe });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) return;
    setError("");
    setResendLoading(true);
    setResendSent(false);
    try {
      await resendVerificationEmail(email);
      setResendSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend verification email");
    } finally {
      setResendLoading(false);
    }
  };

  const isEmailNotVerified = error.toLowerCase().includes("not verified");

  const handleGoogle = async () => {
    setError("");
    setOauthLoading("google");
    try {
      await loginWithGoogle(`${window.location.origin}/dashboard`);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setOauthLoading(null);
    }
  };

  const handleGithub = async () => {
    setError("");
    setOauthLoading("github");
    try {
      await loginWithGithub(`${window.location.origin}/dashboard`);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "GitHub sign-in failed");
    } finally {
      setOauthLoading(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    mx.set(px);
    my.set(py);
    rotateX.set((py - 50) / 40);
    rotateY.set((50 - px) / 40);
  };

  return (
    <div
      className={`relative flex min-h-screen overflow-x-hidden transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
      }`}
    >
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.05); }
          66% { transform: translate(25px, -35px) scale(1.1); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 40px) scale(1.15); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes border-spin {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .shake-animation { animation: shake 0.5s ease-in-out; }
        .shimmer-btn:hover {
          background-size: 200% auto;
          animation: shimmer 2s linear infinite;
        }
        .gradient-border {
          background: linear-gradient(90deg, #8b5cf6, #ec4899, #8b5cf6);
          background-size: 200% auto;
          animation: border-spin 4s linear infinite;
        }
      `}      </style>

      {/* Left Panel */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden lg:flex">
        {/* Unified purple gradient panel (dot-free) */}
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-gradient-to-br from-slate-950 via-violet-950/40 to-slate-950"
              : "bg-gradient-to-br from-violet-100 via-purple-50 to-slate-100"
          }`}
        />
        {/* Subtle vignette for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(20,10,60,0.16)_100%)]" />

        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-[10%] left-[15%] h-72 w-72 rounded-full opacity-40 blur-[80px] accent-gradient"
            style={{ animation: "float1 8s ease-in-out infinite" }}
          />
          <div
            className="absolute top-[50%] right-[10%] h-80 w-80 rounded-full opacity-30 blur-[100px] accent-gradient"
            style={{ animation: "float2 10s ease-in-out infinite" }}
          />
          <div
            className="absolute bottom-[10%] left-[30%] h-64 w-64 rounded-full opacity-35 blur-[70px] accent-gradient"
            style={{ animation: "float3 12s ease-in-out infinite" }}
          />
          <div
            className="absolute top-[30%] left-[50%] h-48 w-48 rounded-full opacity-25 blur-[60px] accent-gradient"
            style={{ animation: "float1 14s ease-in-out infinite reverse" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-md px-8 text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            whileHover={{ scale: 1.08 }}
            className="mx-auto mb-8"
          >
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl accent-gradient blur-xl opacity-50 animate-[pulse-glow_3s_ease-in-out_infinite]" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl shadow-2xl accent-shadow-lg" style={{ animation: "blink1 1.4s ease-in-out infinite" }}>
                <Logo size="lg" />
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-4 text-4xl font-bold"
          >
            <span className="accent-gradient-text">
              Welcome back
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`mb-10 text-lg ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Sign in to your AI engineering workspace
          </motion.p>

          {/* Features */}
          <div className="space-y-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.text}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.15 }}
                whileHover={{ x: 4, scale: 1.02 }}
                className="relative flex items-center gap-4 overflow-hidden rounded-xl border px-5 py-4 text-left transition-colors"
                style={{
                  backgroundColor: isDark ? "#12131f" : "#ffffff",
                  borderColor: feat.featured
                    ? `rgba(${feat.hex},0.6)`
                    : isDark
                      ? "rgba(255,255,255,0.08)"
                      : "#e4e2f0",
                  boxShadow: feat.featured
                    ? isDark
                      ? `0 0 0 1px rgba(${feat.hex},0.25), 0 0 22px rgba(${feat.hex},0.18)`
                      : `0 0 0 1px rgba(${feat.hex},0.15), 0 4px 20px rgba(20,20,40,0.06)`
                    : isDark
                      ? "0 4px 14px rgba(0,0,0,0.25)"
                      : "0 4px 20px rgba(20,20,40,0.06)",
                }}
              >
                {feat.featured && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ background: `linear-gradient(90deg, transparent, rgba(${feat.hex},0.9), transparent)` }}
                  />
                )}
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `rgba(${feat.hex},0.14)`,
                    color: `rgba(${feat.hex},1)`,
                  }}
                >
                  <feat.icon size={18} />
                </motion.div>
                <span className={`text-sm font-medium hover-accent ${isDark ? "text-[#f2f1f8]" : "text-[#14141f]"}`}>
                  {feat.text}
                </span>
                <div className="ml-auto">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.6 + i * 0.2,
                      type: "spring",
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-8"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium hover-text"
            >
              <ArrowLeft size={14} /> Back to Home
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="relative flex w-full items-center justify-center px-6 py-6 lg:py-8 lg:w-1/2">
        {/* Orbiting rings ambient detail */}
        <OrbitingRingsBackground />

        {/* Animated gradient border frame — hugs the card */}
        <div className="relative">
          <div className="gradient-border absolute -inset-[3px] z-0 rounded-3xl p-px opacity-15 blur-[3px]" />

          <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { mx.set(50); my.set(50); rotateX.set(0); rotateY.set(0); }}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          className={`relative z-10 mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border p-6 sm:p-8 ${
            isDark
              ? "border-white/10 bg-[var(--card-bg)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
              : "border-slate-200/50 bg-white shadow-[0_30px_80px_-20px_rgba(90,60,180,0.3)]"
          }`}
        >
          {/* Cursor spotlight */}
          <motion.div
            style={{ background: spotlight }}
            className="pointer-events-none absolute inset-0"
          />

          {/* Mobile logo */}
          <div className="relative text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl shadow-lg accent-shadow">
              <Logo size="md" />
            </div>
          </div>

          <Link
            to="/"
            className="absolute top-4 left-4 inline-flex items-center gap-1.5 text-xs font-medium hover-text"
          >
            <ArrowLeft size={14} /> Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="relative mt-5"
          >
            <div
              className={`mb-1 inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium ${
                isDark ? "text-violet-300" : "text-violet-700"
              }`}
            >
              <Sparkles size={12} /> AI Workspace
            </div>
            <h2
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Sign In
            </h2>
            <p
              className={`mt-1 text-sm ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Enter your credentials to continue
            </p>
          </motion.div>

          {/* Error */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="shake-animation mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                >
                  {error}
                  {isEmailNotVerified && (
                    <button
                      type="button"
                      onClick={() => void handleResendVerification()}
                      disabled={resendLoading}
                      className="mt-2 block w-full rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {resendLoading
                        ? "Sending..."
                        : resendSent
                          ? "Verification email resent"
                          : "Resend verification email"}
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* OAuth */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="relative mt-4 grid grid-cols-2 gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(139,92,246,0.15)" }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setHoveredOauth("google")}
              onMouseLeave={() => setHoveredOauth(null)}
              type="button"
              onClick={() => void handleGoogle()}
              disabled={!!oauthLoading}
              className={`relative flex items-center justify-center gap-2 overflow-hidden rounded-xl border px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50 ${
                isDark
                  ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                  : "border-slate-200 bg-white/80 text-slate-700 hover:bg-white"
              }`}
            >
              {hoveredOauth === "google" && (
                <motion.span
                  layoutId="google-glow"
                  className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                {oauthLoading === "google" ? (
                  <LoadingIndicator size="sm" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Google
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(139,92,246,0.15)" }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setHoveredOauth("github")}
              onMouseLeave={() => setHoveredOauth(null)}
              type="button"
              onClick={() => void handleGithub()}
              disabled={!!oauthLoading}
              className={`relative flex items-center justify-center gap-2 overflow-hidden rounded-xl border px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50 ${
                isDark
                  ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                  : "border-slate-200 bg-white/80 text-slate-700 hover:bg-white"
              }`}
            >
              {hoveredOauth === "github" && (
                <motion.span
                  layoutId="github-glow"
                  className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                {oauthLoading === "github" ? (
                  <LoadingIndicator size="sm" />
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                )}
                GitHub
              </span>
            </motion.button>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative mt-4"
          >
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDark ? "border-white/10" : "border-slate-200"}`} />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className={`px-2 ${isDark ? "bg-[var(--card-bg)] text-slate-500" : "bg-white text-slate-400"}`}>
                or continue with email
              </span>
            </div>
          </motion.div>

          {/* Form */}
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="relative mt-4 space-y-3"
          >
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              <label className={`mb-1.5 block text-xs font-medium transition-colors ${
                focusedField === "email" ? "text-[#a855f7]" : isDark ? "text-slate-400" : "text-slate-500"
              }`}>
                Email address
              </label>
              <div className="relative group">
                <Mail
                  size={16}
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                    focusedField === "email" ? "text-[#a855f7]" : isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-all duration-300 ${
                    focusedField === "email"
                      ? "border-[#a855f7] shadow-[0_0_0_1px_#a855f7,0_0_18px_rgba(168,85,247,0.35)]"
                      : isDark
                        ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                        : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
                {email.trim().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4 }}
            >
              <label className={`mb-1.5 block text-xs font-medium transition-colors ${
                focusedField === "password" ? "text-[#a855f7]" : isDark ? "text-slate-400" : "text-slate-500"
              }`}>
                Password
              </label>
              <div className="relative group">
                <Lock
                  size={16}
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                    focusedField === "password" ? "text-[#a855f7]" : isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your password"
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-11 text-sm outline-none transition-all duration-300 ${
                    focusedField === "password"
                      ? "border-[#a855f7] shadow-[0_0_0_1px_#a855f7,0_0_18px_rgba(168,85,247,0.35)]"
                      : isDark
                        ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                        : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                    isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>

            {/* Remember / Forgot */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.4 }}
              className="flex items-center justify-between"
            >
              <label className="flex cursor-pointer items-center gap-2">
                <motion.input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  whileTap={{ scale: 1.2 }}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[var(--accent)]"
                />
                <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium accent-text-base hover:opacity-80"
              >
                Forgot password?
              </Link>
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.4 }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`shimmer-btn group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl accent-gradient px-4 py-2.5 text-sm font-semibold text-white accent-shadow transition-all hover:accent-shadow-lg disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100`}
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                {loading ? (
                  <LoadingIndicator size="sm" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="relative mt-4 text-center text-sm"
          >
            <span className={isDark ? "text-slate-400" : "text-slate-500"}>
              Don&apos;t have an account?{" "}
            </span>
            <Link
              to="/register"
              className="font-medium accent-text-base hover:opacity-80"
            >
              Sign up
            </Link>
          </motion.p>
        </motion.div>
        </div>
      </div>
    </div>
  );
}
