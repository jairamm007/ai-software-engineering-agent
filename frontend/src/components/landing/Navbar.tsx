import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import Logo from "@/components/common/Logo";

const navigationLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#use-cases", label: "Who It's For" },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${
        isDark
          ? "border-white/[0.06] bg-black/40"
          : "border-slate-200/60 bg-white/70"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-18 sm:px-6 md:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Logo size="md" />
          <div>
            <h1 className={`font-[Outfit] text-base font-bold leading-tight sm:text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
              Repo Verify
            </h1>
            <p className={`hidden text-[10px] font-[Inter] leading-none sm:block ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              AI Software Engineering Agent
            </p>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden gap-8 md:flex">
          {navigationLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors font-[Inter] ${
                isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
              isDark
                ? "border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
                : "border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className={`hidden rounded-full border px-4 py-2 text-sm font-medium transition-all font-[Inter] sm:inline-block ${
              isDark
                ? "border-white/10 text-white hover:bg-white/5"
                : "border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {isAuthenticated ? "Dashboard" : "Sign In"}
          </Link>

          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="rounded-full accent-gradient px-4 py-2 text-sm font-semibold text-white accent-shadow transition-all hover:scale-[1.03] font-[Inter]"
          >
            {isAuthenticated ? "Dashboard" : "Get Started"}
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors md:hidden ${
              isDark
                ? "border-white/10 text-white hover:bg-white/5"
                : "border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`overflow-hidden border-t md:hidden ${
              isDark ? "border-white/[0.06] bg-black/60" : "border-slate-200 bg-white/95"
            }`}
          >
            <nav className="flex flex-col gap-1 p-4">
              {navigationLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors font-[Inter] ${
                    isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <div className={`my-2 border-t ${isDark ? "border-white/5" : "border-slate-200"}`} />
              <Link
                to={isAuthenticated ? "/dashboard" : "/login"}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors font-[Inter] ${
                  isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {isAuthenticated ? "Dashboard" : "Sign In"}
              </Link>
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg accent-gradient px-4 py-3 text-center text-sm font-semibold text-white accent-shadow-lg font-[Inter]"
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
