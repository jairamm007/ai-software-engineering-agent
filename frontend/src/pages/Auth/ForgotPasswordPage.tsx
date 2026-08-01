import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, ArrowRight, Check, KeyRound, Shield, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Logo from "@/components/common/Logo";
import { LoadingIndicator } from "@/components/LoadingIndicator";

const features = [
  { icon: KeyRound, text: "Reset link expires in 1 hour" },
  { icon: Shield, text: "Encrypted and secure process" },
  { icon: Clock, text: "Instant email delivery" },
];

export default function ForgotPasswordPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex min-h-screen overflow-hidden transition-colors duration-300 ${
      isDark
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
    }`}>
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
        @keyframes particle-float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-10px) translateX(-5px); opacity: 0.4; }
          75% { transform: translateY(-30px) translateX(15px); opacity: 0.5; }
        }
      `}</style>

      {/* Left Panel */}
      <div
        className={`relative hidden w-1/2 items-center justify-center overflow-hidden lg:flex ${
          isDark ? "bg-slate-900/50" : "bg-slate-100/80"
        }`}
      >
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
        </div>

        <div className="relative z-10 max-w-md px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="mx-auto mb-8"
          >
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl accent-gradient blur-xl opacity-50 animate-[pulse-glow_3s_ease-in-out_infinite]" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl shadow-2xl accent-shadow-lg">
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
            <span className="accent-gradient-text">Reset your password</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`mb-10 text-lg ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            We&apos;ll get you back on track in no time
          </motion.p>

          <div className="space-y-4">
            {features.map((feat, i) => (
              <motion.div
                key={feat.text}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.15 }}
                className={`flex items-center gap-4 rounded-xl border px-5 py-4 text-left backdrop-blur-sm ${
                  isDark
                    ? "border-white/5 bg-white/5"
                    : "border-slate-200/60 bg-white/60 shadow-sm"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg accent-bg-light">
                  <feat.icon size={18} className="accent-text-base" />
                </div>
                <span className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  {feat.text}
                </span>
                <div className="ml-auto">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 + i * 0.2, type: "spring" }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
            transition={{ delay: 1.0 }}
            className="mt-10"
          >
            <Link
              to="/"
              className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isDark ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-900"
              }`}
            >
              <ArrowLeft size={14} /> Back to Home
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`absolute h-1 w-1 rounded-full ${isDark ? "accent-bg-light" : "accent-bg-light"}`}
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                animation: `particle-float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={`relative z-10 w-full max-w-md space-y-6 rounded-3xl border p-6 sm:p-8 shadow-2xl backdrop-blur-xl ${
            isDark
              ? "border-white/10 bg-white/[0.07] shadow-black/20"
              : "border-slate-200/50 bg-white/60 shadow-slate-200/50"
          }`}
        >
          {/* Mobile logo */}
          <div className="text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl shadow-lg accent-shadow">
              <Logo size="md" />
            </div>
          </div>

          <Link
            to="/login"
            className={`absolute top-4 left-4 inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
              isDark
                ? "text-slate-500 hover:text-white"
                : "text-slate-400 hover:text-slate-900"
            }`}
          >
            <ArrowLeft size={14} /> Sign In
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {sent ? "Check your email" : "Forgot password?"}
            </h2>
            <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {sent
                ? `We've sent a password reset link to ${email}`
                : "Enter your email and we'll send you a reset link"
              }
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
                  <Check size={36} className="text-emerald-500" />
                </div>
              </div>
              <p className={`text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Didn&apos;t receive the email? Check your spam folder or{" "}
                <button type="button" onClick={() => setSent(false)} className="font-medium accent-text-base hover:opacity-80">
                  try again
                </button>
              </p>
            </motion.div>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <label className={`mb-1.5 block text-xs font-medium transition-colors ${
                  focusedField === "email" ? "text-[var(--accent)]" : isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  Email address
                </label>
                <div className="relative group">
                  <Mail
                    size={16}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                      focusedField === "email" ? "text-[var(--accent)]" : isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@example.com"
                    className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition-all duration-300 ${
                      focusedField === "email"
                        ? "border-[var(--accent)] shadow-[0_0_15px_var(--accent-light)]"
                        : isDark
                          ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                          : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                    }`}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="shimmer-btn flex w-full items-center justify-center gap-2 rounded-xl accent-gradient px-4 py-3 text-sm font-semibold text-white accent-shadow transition-all hover:accent-shadow-lg disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
                >
                  {loading ? (
                    <LoadingIndicator size="sm" />
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={`text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Remember your password?{" "}
            <Link to="/login" className="font-medium accent-text-base hover:opacity-80">
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
