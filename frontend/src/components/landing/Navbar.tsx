import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Sun, Moon, Menu, X, Shield } from "lucide-react";
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
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("#")) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleRouteClick = (to: string) => {
    setMobileOpen(false);
    navigate(to);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

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
        {/* Logo - click to scroll to top */}
        <button
          type="button"
          onClick={() => handleRouteClick("/")}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          title="Go to top"
        >
          <Logo size="md" showText />
        </button>

        {/* Desktop nav */}
        <nav className="hidden gap-8 md:flex">
          {navigationLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
              className={`text-sm font-medium transition-colors font-[Inter] cursor-pointer ${
                isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => handleRouteClick("/admin/login")}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors font-[Inter] cursor-pointer ${
              isDark ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-700"
            }`}
          >
            <Shield size={13} />
            Admin
          </button>
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

          <button
            type="button"
            onClick={() => handleRouteClick(isAuthenticated ? "/dashboard" : "/login")}
            className={`hidden rounded-full border px-4 py-2 text-sm font-medium transition-all font-[Inter] sm:inline-block cursor-pointer ${
              isDark
                ? "border-white/10 text-white hover:bg-white/5"
                : "border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {isAuthenticated ? "Dashboard" : "Sign In"}
          </button>

          <button
            type="button"
            onClick={() => handleRouteClick(isAuthenticated ? "/dashboard" : "/register")}
            className="rounded-full accent-gradient px-4 py-2 text-sm font-semibold text-white accent-shadow transition-all hover:scale-[1.03] font-[Inter] cursor-pointer"
          >
            {isAuthenticated ? "Dashboard" : "Get Started"}
          </button>

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
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors font-[Inter] cursor-pointer ${
                    isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => handleRouteClick("/admin/login")}
                className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors font-[Inter] cursor-pointer ${
                  isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-600 hover:bg-red-50"
                }`}
              >
                <Shield size={13} />
                Admin
              </button>
              <div className={`my-2 border-t ${isDark ? "border-white/5" : "border-slate-200"}`} />
              <button
                type="button"
                onClick={() => handleRouteClick(isAuthenticated ? "/dashboard" : "/login")}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors font-[Inter] cursor-pointer ${
                  isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {isAuthenticated ? "Dashboard" : "Sign In"}
              </button>
              <button
                type="button"
                onClick={() => handleRouteClick(isAuthenticated ? "/dashboard" : "/register")}
                className="rounded-lg accent-gradient px-4 py-3 text-center text-sm font-semibold text-white accent-shadow-lg font-[Inter] cursor-pointer"
              >
                {isAuthenticated ? "Dashboard" : "Get Started"}
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
