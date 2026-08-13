import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, Settings, User, LogOut, ChevronDown, BookOpen } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/search": "Search",
  "/repositories": "Repositories",
  "/chat": "AI Chat",
  "/code-review": "Code Review",
  "/runs": "Runs",
  "/architecture": "Architecture",
  "/documentation": "Documentation",
  "/testing": "Testing",
  "/analytics": "Analytics",
  "/favorites": "Favorites",
  "/history": "History",
  "/settings": "Settings",
  "/profile": "Profile",
};

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { user, isAuthenticated, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pageTitle =
    routeLabels[location.pathname] ||
    (location.pathname.startsWith("/runs") ? "Runs" : "Dashboard");

  return (
    <header className={`sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b px-4 sm:px-6 ${
      isDark
        ? "border-white/[0.06] bg-[#0B0614]/80 backdrop-blur-xl"
        : "border-slate-200/80 bg-white/80 backdrop-blur-xl"
    }`}>
      {/* Left: Page title / breadcrumb */}
      <div className="flex items-center gap-2">
        <h1 className={`font-[Outfit] text-sm font-semibold sm:text-base ${
          isDark ? "text-white" : "text-slate-900"
        }`}>
          {pageTitle}
        </h1>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            isDark
              ? "text-slate-400 hover:bg-white/5 hover:text-white"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={() => navigate("/settings")}
          title="Settings"
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            isDark
              ? "text-slate-400 hover:bg-white/5 hover:text-white"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Settings size={16} />
        </button>

        {/* Divider */}
        <div className={`mx-1.5 h-5 w-px ${isDark ? "bg-white/10" : "bg-slate-200"}`} />

        {/* User avatar dropdown */}
        {isAuthenticated && user && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                isDark
                  ? "hover:bg-white/5"
                  : "hover:bg-slate-100"
              }`}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full accent-gradient text-[11px] font-bold text-white font-[Inter]">
                {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className={`hidden text-xs font-medium font-[Inter] sm:block ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}>
                {user.name || "User"}
              </span>
              <ChevronDown size={14} className={`hidden sm:block ${isDark ? "text-slate-500" : "text-slate-400"}`} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border shadow-xl ${
                    isDark
                      ? "border-white/[0.06] bg-[#110C1D]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {/* User info */}
                  <div className={`border-b px-4 py-3 ${
                    isDark ? "border-white/[0.06]" : "border-slate-100"
                  }`}>
                    <p className={`text-xs font-medium font-[Inter] ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                      {user.name || "User"}
                    </p>
                    <p className={`text-[11px] font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      {user.email}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => { navigate("/profile"); setProfileOpen(false); }}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium font-[Inter] transition-colors ${
                        isDark
                          ? "text-slate-300 hover:bg-white/5"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <User size={14} />
                      My Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => { navigate("/settings"); setProfileOpen(false); }}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium font-[Inter] transition-colors ${
                        isDark
                          ? "text-slate-300 hover:bg-white/5"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Settings size={14} />
                      Account Settings
                    </button>
                    <button
                      type="button"
                      onClick={() => { navigate("/user-guide"); setProfileOpen(false); }}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium font-[Inter] transition-colors ${
                        isDark
                          ? "text-slate-300 hover:bg-white/5"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <BookOpen size={14} />
                      User Guide
                    </button>
                  </div>

                  {/* Sign out */}
                  <div className={`border-t p-1.5 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
                    <button
                      type="button"
                      onClick={() => { logout(); setProfileOpen(false); }}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium font-[Inter] transition-colors ${
                        isDark
                          ? "text-red-400 hover:bg-red-500/10"
                          : "text-red-500 hover:bg-red-50"
                      }`}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
