import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const navigationLinks = [
  { href: "#features", label: "Features" },
  { href: "#workflow", label: "Workflow" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 md:px-8">
        <h1 className={`text-lg font-bold sm:text-2xl ${isDark ? "text-white" : "text-slate-900"}`}>
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

        <div className="flex items-center gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors sm:h-10 sm:w-10 ${
              isDark
                ? "border-white/20 text-yellow-400 hover:bg-white/10"
                : "border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden sm:block">
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                isDark
                  ? "border-white/20 text-white hover:bg-white/10"
                  : "border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {isAuthenticated ? "Dashboard" : "Sign In"}
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden sm:block">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-shadow hover:shadow-xl hover:shadow-violet-500/40"
            >
              {isAuthenticated ? "Dashboard" : "Get Started"}
            </Link>
          </motion.div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors md:hidden ${
              isDark
                ? "border-white/20 text-white hover:bg-white/10"
                : "border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`overflow-hidden border-t md:hidden ${
              isDark ? "border-white/10 bg-black/80" : "border-slate-200 bg-white/95"
            }`}
          >
            <nav className="flex flex-col gap-1 p-4">
              {navigationLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <div className="my-2 border-t border-slate-200/10" />
              <Link
                to={isAuthenticated ? "/dashboard" : "/login"}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {isAuthenticated ? "Dashboard" : "Sign In"}
              </Link>
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-center text-sm font-medium text-white shadow-lg shadow-violet-500/25"
              >
                {isAuthenticated ? "Dashboard" : "Get Started"}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
