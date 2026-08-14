import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldX, ArrowLeft, Home, Lock } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function AdminAccessDeniedPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`relative flex min-h-screen items-center justify-center overflow-hidden px-4 ${
      isDark ? "bg-[#0a0a0f]" : "bg-[#f8fafc]"
    }`}>
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -60, 30, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[15%] h-80 w-80 rounded-full bg-gradient-to-br from-red-500 to-orange-600 opacity-[0.07] blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 40, -40, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[15%] right-[15%] h-72 w-72 rounded-full bg-gradient-to-br from-amber-500 to-red-600 opacity-[0.05] blur-[90px]"
        />
        <motion.div
          animate={{
            x: [0, 20, -30, 0],
            y: [0, -20, 50, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[50%] left-[60%] h-64 w-64 rounded-full bg-gradient-to-br from-rose-600 to-pink-500 opacity-[0.04] blur-[80px]"
        />
      </div>

      {/* Grid pattern overlay */}
      <div className={`absolute inset-0 pointer-events-none ${
        isDark ? "opacity-[0.03]" : "opacity-[0.04]"
      }`}>
        <div className="h-full w-full" style={{
          backgroundImage: `linear-gradient(${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 text-center max-w-lg"
      >
        {/* Shield icon with glow */}
        <motion.div
          initial={{ scale: 0.4, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 200, damping: 20 }}
          className="mx-auto mb-10"
        >
          <div className="relative inline-flex items-center justify-center">
            {/* Outer glow ring */}
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-red-500 to-orange-600 blur-2xl opacity-30"
            />
            {/* Card */}
            <div className={`relative flex h-28 w-28 items-center justify-center rounded-3xl shadow-2xl ${
              isDark ? "shadow-red-500/20" : "shadow-red-500/15"
            } bg-gradient-to-br from-red-500 to-orange-600`}>
              <ShieldX size={56} className="text-white" strokeWidth={1.5} />
            </div>
          </div>
        </motion.div>

        {/* Error code */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className={`mb-2 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wider uppercase ${
            isDark
              ? "border-red-500/20 bg-red-500/10 text-red-400"
              : "border-red-200 bg-red-50 text-red-600"
          }`}>
            <Lock size={12} />
            Restricted
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={`mb-2 text-7xl font-black tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}
        >
          403
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className={`mb-4 text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
        >
          Access Denied
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className={`mb-10 text-[15px] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          You do not have administrator privileges to access this portal.
          Contact your system administrator if you believe this is an error.
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className={`mb-8 h-px ${isDark ? "bg-white/[0.06]" : "bg-slate-200"}`}
        />

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex items-center justify-center gap-3"
        >
          <Link
            to="/"
            className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
              isDark
                ? "border-white/[0.06] bg-[var(--card-bg)] text-slate-300 hover:bg-white/[0.06] hover:border-white/[0.1]"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-md shadow-slate-200/40"
            }`}
          >
            <Home size={15} />
            Go Home
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-rose-500/20 transition-all duration-200 hover:shadow-xl hover:shadow-rose-500/30 hover:brightness-110"
          >
            <ArrowLeft size={15} />
            User Dashboard
          </Link>
        </motion.div>

        {/* Decorative bottom element */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className={`mt-12 text-xs ${isDark ? "text-slate-600" : "text-slate-300"}`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <div className={`h-1 w-1 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-300"}`} />
            <div className={`h-1 w-1 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-300"}`} />
            <div className={`h-1 w-1 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-300"}`} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
