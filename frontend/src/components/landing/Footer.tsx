import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import Logo from "@/components/common/Logo";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Who It's For", href: "#use-cases" },
  { label: "User Guide", to: "/user-guide" },
];

const resources = [
  { label: "Documentation", to: "/docs" },
  { label: "Blog", to: "/blog" },
  { label: "Changelog", to: "/changelog" },
  { label: "FAQ", to: "/faq" },
  { label: "Support", to: "/support" },
];

const company = [
  { label: "About", to: "/about" },
  { label: "Careers", to: "/careers" },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
];

function NavLink({ href, to, label }: { href?: string; to?: string; label: string }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (href) {
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          if (location.pathname !== "/") {
            navigate("/");
            setTimeout(() => {
              document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          } else {
            document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
          }
        }}
        className="text-sm font-[Inter] cursor-pointer hover-text"
      >
        {label}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        navigate(to!);
        window.scrollTo({ top: 0, behavior: "instant" });
      }}
      className="text-sm font-[Inter] text-left cursor-pointer hover-text"
    >
      {label}
    </button>
  );
}

export default function Footer() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  return (
    <footer className={`relative z-10 border-t px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20 ${isDark ? "border-white/[0.06]" : "border-slate-200"}`}>
      <div className="mx-auto max-w-7xl">
        <div className={`overflow-hidden rounded-2xl border backdrop-blur-xl ${isDark ? "border-white/[0.08] bg-white/[0.04] shadow-lg shadow-black/20" : "border-slate-200/70 bg-white/60 shadow-md shadow-slate-200/60"}`}>
          <div className="grid gap-10 p-6 sm:p-8 md:grid-cols-4">
            {/* Brand */}
            <div>
              <button
                type="button"
                onClick={() => {
                  navigate("/");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-2 mb-4 transition-opacity hover:opacity-80"
                title="Go to top"
              >
                <Logo size="sm" showText />
              </button>
              <p className={`text-sm leading-relaxed font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                AI-powered code generation, review, analysis, and documentation for modern development teams.
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
                    <NavLink {...link} />
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
                    <NavLink {...link} />
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
                    <NavLink {...link} />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom copyright bar */}
          <div className={`flex flex-wrap items-center justify-between gap-4 border-t px-6 py-5 sm:px-8 ${isDark ? "border-white/[0.08]" : "border-slate-200/70"}`}>
            <p className={`text-sm font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              &copy; {new Date().getFullYear()} Repo Verify. All rights reserved.
            </p>
            <div className="flex gap-6">
              <button
                type="button"
                onClick={() => { navigate("/dashboard"); window.scrollTo({ top: 0 }); }}
                className="text-sm font-[Inter] cursor-pointer hover-text"
              >
                Dashboard
              </button>
              <a href="https://github.com/jairamm007/ai-software-engineering-agent" target="_blank" rel="noopener noreferrer" className="text-sm font-[Inter] hover-text">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
