import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const navigationLinks = [
  { href: "#features", label: "Features" },
  { href: "#workflow", label: "Workflow" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${
        isDark
          ? "border-white/10 bg-black/50"
          : "border-slate-200/80 bg-white/80"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
        <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
          AI Software Engineering Agent
        </h1>

        <nav className="hidden gap-10 md:flex">
          {navigationLinks.map((link) => (
            <motion.a
              key={link.href}
              whileHover={{ scale: 1.08, color: "#A855F7" }}
              href={link.href}
              className={`transition-colors ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {link.label}
            </motion.a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
              isDark
                ? "border-white/20 text-yellow-400 hover:bg-white/10"
                : "border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/dashboard"
              className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                isDark
                  ? "border-white/20 text-white hover:bg-white/10"
                  : "border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              Sign In
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/dashboard"
              className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-shadow hover:shadow-xl hover:shadow-violet-500/40"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
