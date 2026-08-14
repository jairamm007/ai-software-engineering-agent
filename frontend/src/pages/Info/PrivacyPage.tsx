import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import Reveal from "@/components/motion/Reveal";
import SpotlightCard from "@/components/motion/SpotlightCard";
import PageHero from "@/components/motion/PageHero";
import ScrollProgress from "@/components/motion/ScrollProgress";
import BackToTop from "@/components/motion/BackToTop";
import { glassCard } from "@/components/motion/styles";
import { Shield, Lock, Eye, Trash2, Database, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  {
    icon: Database,
    title: "Data We Collect",
    accent: "text-cyan-500",
    content: `When you use Repo Verify, we collect the following information:

• Account information: name, email address, and profile image (from OAuth providers like GitHub and Google).
• Repository data: When you analyze a repository, we clone it temporarily, index file structures, and generate semantic embeddings. Raw source code is not stored permanently — only mathematical representations (embeddings) used for AI search.
• Usage analytics: Pages visited, features used, and interaction patterns — anonymized and used to improve the product.
• API logs: Request/response metadata for debugging and performance monitoring (retained for 30 days).`,
  },
  {
    icon: Lock,
    title: "How We Protect Your Data",
    accent: "text-violet-500",
    content: `• All data is encrypted in transit (TLS 1.3) and at rest (AES-256).
• Repository analysis runs in isolated, ephemeral environments that are destroyed after processing.
• We use SOC 2 Type II compliant infrastructure (AWS/GCP).
• Access to user data is restricted to authorized personnel only, with audit logging.
• We never sell, share, or monetize your source code or repository data with third parties.`,
  },
  {
    icon: Eye,
    title: "AI and Your Code",
    accent: "text-fuchsia-500",
    content: `• Our AI models (GPT-4, Claude) process your code to generate analyses, reviews, and documentation.
• Code sent to AI providers is processed ephemerally and not used for model training.
• Embeddings generated from your code are stored securely and are not reversible to raw source code.
• You can request a full data export or deletion at any time from your dashboard settings.`,
  },
  {
    icon: Trash2,
    title: "Data Retention & Deletion",
    accent: "text-emerald-500",
    content: `• Repository embeddings: Retained until you delete the repository from your dashboard.
• Account data: Retained as long as your account is active. Deleted within 30 days of account closure.
• API logs: Automatically purged after 30 days.
• Session data: Cleared when you sign out. JWT tokens expire after 7 days.
• You can request immediate deletion of all your data by contacting support@repo-verify.dev.`,
  },
  {
    icon: Globe,
    title: "Cookies & Tracking",
    accent: "text-amber-500",
    content: `• Essential cookies: Session management and authentication (required).
• Analytics cookies: Anonymous usage tracking via our own analytics (optional, can be disabled).
• We do not use third-party advertising cookies or trackers.
• You can manage cookie preferences in your browser settings.`,
  },
];

export default function PrivacyPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn("min-h-screen font-[Inter] transition-colors duration-300", isDark ? "bg-[#07030F] text-white" : "bg-white text-slate-900")}
    >
      <ScrollProgress className="bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <PageHero
          icon={Shield}
          label="Privacy Policy"
          badgeClass={isDark ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-300" : "border-cyan-200 bg-cyan-100 text-cyan-700"}
          titleBefore={["Your", "Data,"]}
          gradientWord="Your"
          titleAfter={["Control"]}
          subtitle="Last updated: June 2026. We believe in transparency about what we collect and why."
          gradientClass="from-cyan-400 via-violet-400 to-fuchsia-400"
          glowClass="rgba(34, 211, 238, 0.12)"
        />

        <div className="space-y-10">
          {sections.map((section, si) => {
            const Icon = section.icon;
            return (
              <Reveal key={section.title} delay={si * 0.05} y={32}>
                <SpotlightCard
                  spotlightColor={isDark ? "rgba(34, 211, 238, 0.1)" : "rgba(34, 211, 238, 0.08)"}
                  className={cn("rounded-2xl border transition-shadow duration-300", glassCard(isDark), isDark ? "hover:shadow-xl hover:shadow-cyan-500/10" : "hover:shadow-xl hover:shadow-slate-200/60")}
                  innerClassName="p-6 sm:p-8"
                >
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15, duration: 0.9, ease: "easeOut" }}
                    className="absolute inset-x-6 top-0 h-[2px] origin-left rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500"
                  />

                  <div className="mb-4 flex items-center gap-3">
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 350, damping: 14 }}
                      className={cn("flex h-11 w-11 items-center justify-center rounded-xl border", isDark ? "border-cyan-500/20 bg-cyan-500/10" : "border-cyan-200 bg-cyan-100")}
                    >
                      <Icon size={20} className={section.accent} />
                    </motion.div>
                    <h2 className="font-[Outfit] text-xl font-bold">{section.title}</h2>
                  </div>

                  <div className={cn("whitespace-pre-line rounded-xl border p-5 text-sm leading-relaxed", isDark ? "border-white/[0.06] bg-[var(--card-bg)] text-slate-400" : "border-slate-200/70 bg-white/50 text-slate-500")}>
                    {section.content}
                  </div>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-1.5 text-center">
          <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
            Questions about your privacy?{" "}
            <Link to="/support" className="font-medium text-violet-500 transition-colors hover:text-violet-400">
              Visit our Support page
            </Link>
          </p>
          <p className={cn("text-xs", isDark ? "text-slate-600" : "text-slate-400")}>
            Last updated: June 2026
          </p>
        </div>
      </div>

      <BackToTop />
    </motion.main>
  );
}
