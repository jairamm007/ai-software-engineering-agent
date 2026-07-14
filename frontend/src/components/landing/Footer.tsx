import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

const internalLinks = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Pricing", href: "#pricing" },
];

const resources = [
  { label: "Documentation", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Changelog", href: "#" },
  { label: "Support", href: "#" },
];

const company = [
  { label: "About", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
];

export default function Footer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <footer id="contact" className={`border-t px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20 ${isDark ? "border-white/10" : "border-slate-200"}`}>
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-xl font-bold">
              AI Software
              <br />
              Engineering Agent
            </h3>
            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              AI-powered repository analysis, code review, and documentation
              generation for modern development teams.
            </p>
          </div>

          <div>
            <h4 className={`mb-4 text-sm font-semibold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Product
            </h4>
            <ul className="space-y-3">
              {internalLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={`text-sm transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link to="/dashboard" className={`text-sm transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={`mb-4 text-sm font-semibold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Resources
            </h4>
            <ul className="space-y-3">
              {resources.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={`text-sm transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={`mb-4 text-sm font-semibold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Company
            </h4>
            <ul className="space-y-3">
              {company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={`text-sm transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`mt-16 flex flex-wrap items-center justify-between gap-4 border-t pt-8 ${isDark ? "border-white/10" : "border-slate-200"}`}>
          <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            &copy; {new Date().getFullYear()} AI Software Engineering Agent. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/dashboard" className={`text-sm transition-colors ${isDark ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-900"}`}>
              Dashboard
            </Link>
            <a href="#" className={`text-sm transition-colors ${isDark ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-900"}`}>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
