import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { Sparkles } from "lucide-react";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Who It's For", href: "#use-cases" },
  { label: "Dashboard", href: "/dashboard" },
];

const resources = [
  { label: "Documentation", href: "/docs" },
  { label: "Blog", href: "/blog" },
  { label: "Changelog", href: "/changelog" },
  { label: "FAQ", href: "/faq" },
  { label: "Support", href: "/support" },
];

const company = [
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export default function Footer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <footer className={`border-t px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20 ${isDark ? "border-white/[0.06]" : "border-slate-200"}`}>
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600">
                <Sparkles size={16} className="text-white" />
              </div>
              <h3 className="font-[Outfit] text-lg font-bold">Repo Verify</h3>
            </div>
            <p className={`text-sm leading-relaxed font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              AI-powered repository analysis, code review, and documentation generation for modern development teams.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className={`mb-4 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Product
            </h4>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("/") ? (
                    <Link to={link.href} className={`text-sm transition-colors font-[Inter] ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className={`text-sm transition-colors font-[Inter] ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className={`mb-4 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Resources
            </h4>
            <ul className="space-y-2.5">
              {resources.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("/") ? (
                    <Link to={link.href} className={`text-sm transition-colors font-[Inter] ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className={`text-sm transition-colors font-[Inter] ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className={`mb-4 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Company
            </h4>
            <ul className="space-y-2.5">
              {company.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("/") ? (
                    <Link to={link.href} className={`text-sm transition-colors font-[Inter] ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className={`text-sm transition-colors font-[Inter] ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`mt-14 flex flex-wrap items-center justify-between gap-4 border-t pt-8 ${isDark ? "border-white/[0.06]" : "border-slate-200"}`}>
          <p className={`text-sm font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            &copy; {new Date().getFullYear()} Repo Verify. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/dashboard" className={`text-sm transition-colors font-[Inter] ${isDark ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-900"}`}>
              Dashboard
            </Link>
            <a href="https://github.com/anomalyco/opencode" target="_blank" rel="noopener noreferrer" className={`text-sm transition-colors font-[Inter] ${isDark ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-900"}`}>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
