import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Bot,
  Shield,
  Zap,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Logo from "@/components/common/Logo";

const float1 = `
@keyframes float1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}`;
const float2 = `
@keyframes float2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-40px, 30px) scale(1.15); }
  66% { transform: translate(25px, -40px) scale(0.85); }
}`;
const float3 = `
@keyframes float3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(20px, 40px) scale(0.9); }
  66% { transform: translate(-35px, -25px) scale(1.1); }
}`;
const shimmer = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}`;
const particleDrift = `
@keyframes particleDrift {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
}`;

const features = [
  { icon: Zap, text: "Free to start, no credit card", color: "text-amber-400" },
  { icon: Bot, text: "AI code review and documentation", color: "text-violet-400" },
  { icon: Shield, text: "Security vulnerability scanning", color: "text-emerald-400" },
];

export default function RegisterPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const { register, loginWithGoogle, loginWithGithub } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const passwordStrength = useMemo(() => {
    if (!password) return { level: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { level: 1, label: "Weak", color: "from-red-500 to-rose-500" };
    if (score <= 3) return { level: 2, label: "Medium", color: "from-amber-500 to-orange-500" };
    return { level: 3, label: "Strong", color: "from-emerald-500 to-green-500" };
  }, [password]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 10,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 10,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
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
      await register({ name, email, password, confirmPassword });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setOauthLoading("google");
    try {
      await loginWithGoogle();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-up failed");
    } finally {
      setOauthLoading(null);
    }
  };

  const handleGithub = async () => {
    setError("");
    setOauthLoading("github");
    try {
      await loginWithGithub();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "GitHub sign-up failed");
    } finally {
      setOauthLoading(null);
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
  };

  return (
    <>
      <style>{float1 + float2 + float3 + shimmer + particleDrift}</style>
      <div className={`flex min-h-screen overflow-hidden transition-colors duration-300 ${
        isDark ? "bg-slate-950" : "bg-slate-100"
      }`}>

        {/* Left Panel */}
        <div className="relative hidden w-1/2 lg:flex items-center justify-center overflow-hidden">
          <div className={`absolute inset-0 ${isDark
            ? "bg-gradient-to-br from-slate-900 via-[var(--accent)]/10 to-slate-950"
            : "bg-gradient-to-br from-slate-50 via-[var(--accent-light)] to-slate-100"
          }`} />

          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-[var(--accent)]/20 blur-3xl"
            style={{ animation: "float1 12s ease-in-out infinite" }} />
          <div className="absolute bottom-32 right-16 w-96 h-96 rounded-full bg-[var(--accent)]/15 blur-3xl"
            style={{ animation: "float2 15s ease-in-out infinite" }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl"
            style={{ animation: "float3 18s ease-in-out infinite" }} />
          <div className="absolute bottom-16 left-1/4 w-48 h-48 rounded-full bg-pink-500/10 blur-3xl"
            style={{ animation: "float1 20s ease-in-out infinite reverse" }} />

          <div className="relative z-10 max-w-md px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-8 flex justify-center"
            >
              <Logo size="lg" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`text-4xl font-bold leading-tight ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Start building{" "}
              <span className="accent-gradient-text">
                smarter
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={`mt-3 text-lg ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Create your account and unlock AI-powered code analysis
            </motion.p>

            <div className="mt-10 space-y-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.text}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={staggerItem}
                  className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-medium ${
                    isDark
                      ? "bg-white/5 border border-white/5 text-slate-200 backdrop-blur-sm"
                      : "bg-white/80 border border-slate-200/60 text-slate-700 shadow-sm"
                  }`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${isDark ? "bg-white/10" : "accent-bg-light"}`}>
                    <Check size={14} className="text-emerald-400" />
                  </div>
                  <span>{f.text}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-10"
            >
              <Link
                to="/"
                className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                  isDark ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-900"
                }`}
              >
                <ArrowLeft size={14} />
                Back to Home
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div
          className="relative flex w-full items-center justify-center px-4 py-8 sm:px-6 lg:w-1/2"
          onMouseMove={handleMouseMove}
        >
          {/* Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 rounded-full ${isDark ? "accent-bg-light" : "accent-bg-light"}`}
                style={{
                  left: `${Math.random() * 100}%`,
                  bottom: "-10px",
                  animation: `particleDrift ${8 + Math.random() * 12}s linear infinite`,
                  animationDelay: `${Math.random() * 10}s`,
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              perspective: "1000px",
              transform: `rotateX(${-mousePos.y * 0.15}deg) rotateY(${mousePos.x * 0.15}deg)`,
            }}
            className={`relative w-full max-w-md rounded-3xl border p-6 sm:p-8 shadow-2xl transition-transform duration-300 ease-out ${
              isDark
                ? "border-white/10 bg-white/5 backdrop-blur-xl shadow-black/40"
                : "border-slate-200/50 bg-white/60 backdrop-blur-xl shadow-slate-300/40"
            }`}
          >
            {/* Mobile Logo */}
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 flex justify-center lg:hidden">
              <Logo size="md" />
            </motion.div>

            <Link
              to="/"
              className={`absolute top-4 left-4 inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
                isDark ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-900"
              }`}
            >
              <ArrowLeft size={14} /> Home
            </Link>

            <div className="mt-6">
              <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                Create Account
              </h2>
              <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Fill in your details to get started
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: 1, x: [-10, 10, -10, 10, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(167,139,250,0.2)" }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => void handleGoogle()}
                disabled={!!oauthLoading}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all disabled:opacity-50 ${
                  isDark
                    ? "border-white/15 text-slate-200 hover:bg-white/5 hover:border-white/25"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {oauthLoading === "google" ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Google
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(167,139,250,0.2)" }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => void handleGithub()}
                disabled={!!oauthLoading}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all disabled:opacity-50 ${
                  isDark
                    ? "border-white/15 text-slate-200 hover:bg-white/5 hover:border-white/25"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {oauthLoading === "github" ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                )}
                GitHub
              </motion.button>
            </div>

            <div className="relative my-6">
              <div className={`absolute inset-0 flex items-center`}>
                <div className={`w-full border-t ${isDark ? "border-white/10" : "border-slate-200"}`} />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className={`px-3 ${isDark ? "bg-white/5 text-slate-500" : "bg-white/60 text-slate-400"}`}>or</span>
              </div>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              {[
                { key: "name", label: "Full Name", type: "text", icon: User, placeholder: "John Doe", value: name, setter: setName },
                { key: "email", label: "Email", type: "email", icon: Mail, placeholder: "you@example.com", value: email, setter: setEmail },
              ].map((field, i) => (
                <motion.div key={field.key} custom={i + 2} initial="hidden" animate="visible" variants={staggerItem}>
                  <label className={`mb-1.5 block text-xs font-medium transition-colors ${
                    focusedField === field.key ? "text-[var(--accent)]" : isDark ? "text-slate-400" : "text-slate-500"
                  }`}>
                    {field.label}
                  </label>
                  <div className="relative group">
                    <field.icon
                      size={16}
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                        focusedField === field.key ? "text-[var(--accent)]" : isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    />
                    <input
                      type={field.type}
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      onFocus={() => setFocusedField(field.key)}
                      onBlur={() => setFocusedField(null)}
                      placeholder={field.placeholder}
                      className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition-all duration-300 ${
                        focusedField === field.key
                          ? "border-[var(--accent)] shadow-[0_0_15px_var(--accent-light)]"
                          : isDark
                            ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                            : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                      }`}
                    />
                  </div>
                </motion.div>
              ))}

              <motion.div custom={4} initial="hidden" animate="visible" variants={staggerItem}>
                <label className={`mb-1.5 block text-xs font-medium transition-colors ${
                  focusedField === "password" ? "text-[var(--accent)]" : isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    size={16}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                      focusedField === "password" ? "text-[var(--accent)]" : isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="At least 6 characters"
                    className={`w-full rounded-xl border py-3 pl-11 pr-11 text-sm outline-none transition-all duration-300 ${
                      focusedField === "password"
                        ? "border-[var(--accent)] shadow-[0_0_15px_var(--accent-light)]"
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

                {password && (
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                              passwordStrength.level >= level
                                ? `bg-gradient-to-r ${passwordStrength.color}`
                                : isDark ? "bg-white/10" : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`ml-3 text-xs font-medium ${
                        passwordStrength.level === 1 ? "text-red-400"
                          : passwordStrength.level === 2 ? "text-amber-400"
                          : passwordStrength.level === 3 ? "text-emerald-400"
                          : isDark ? "text-slate-500" : "text-slate-400"
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.div custom={5} initial="hidden" animate="visible" variants={staggerItem}>
                <label className={`mb-1.5 block text-xs font-medium transition-colors ${
                  focusedField === "confirm" ? "text-[var(--accent)]" : isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock
                    size={16}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                      focusedField === "confirm" ? "text-[var(--accent)]" : isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField("confirm")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Repeat your password"
                    className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition-all duration-300 ${
                      focusedField === "confirm"
                        ? "border-[var(--accent)] shadow-[0_0_15px_var(--accent-light)]"
                        : isDark
                          ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600"
                          : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                    }`}
                  />
                </div>
              </motion.div>

              <motion.div custom={6} initial="hidden" animate="visible" variants={staggerItem}>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(139,92,246,0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl accent-gradient px-4 py-3 text-sm font-semibold text-white accent-shadow transition-all disabled:opacity-50 disabled:shadow-none group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_1.5s_ease-in-out_infinite]" />
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <span className="relative flex items-center gap-2">
                      Create Account
                      <ArrowRight size={16} />
                    </span>
                  )}
                </motion.button>
              </motion.div>
            </form>

            <motion.p
              custom={7}
              initial="hidden"
              animate="visible"
              variants={staggerItem}
              className={`mt-6 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Already have an account?{" "}
              <Link to="/login" className="font-medium accent-text-base hover:opacity-80 transition-colors">
                Sign in
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
