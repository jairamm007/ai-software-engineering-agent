import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import PlexusTerrainBackground from "@/components/landing/PlexusTerrainBackground";
import GradientOrbs from "@/components/motion/GradientOrbs";
import Reveal from "@/components/motion/Reveal";
import SpotlightCard from "@/components/motion/SpotlightCard";
import Magnetic from "@/components/motion/Magnetic";
import PageHero from "@/components/motion/PageHero";
import ScrollProgress from "@/components/motion/ScrollProgress";
import BackToTop from "@/components/motion/BackToTop";
import { glassCard } from "@/components/motion/styles";
import { Link } from "react-router-dom";
import { LifeBuoy, Code2, Mail, MessageCircle, FileQuestion, ExternalLink, ArrowUpRight } from "lucide-react";

const channels = [
  {
    icon: Code2,
    title: "GitHub Issues",
    desc: "Report bugs, request features, or browse known issues.",
    action: "Open Issues",
    href: "https://github.com/anomalyco/opencode/issues",
    gradient: "from-slate-500 to-slate-700",
    ring: (isDark: boolean) => (isDark ? "hover:shadow-slate-500/10" : "hover:shadow-slate-300/50"),
  },
  {
    icon: Mail,
    title: "Email Support",
    desc: "For account issues, billing, or private inquiries.",
    action: "support@repo-verify.dev",
    href: "mailto:support@repo-verify.dev",
    gradient: "from-violet-500 to-fuchsia-600",
    ring: (isDark: boolean) => (isDark ? "hover:shadow-violet-500/15" : "hover:shadow-violet-200/60"),
  },
  {
    icon: MessageCircle,
    title: "Community Discord",
    desc: "Join 2,000+ developers discussing AI-powered code analysis.",
    action: "Join Discord",
    href: "#",
    gradient: "from-indigo-500 to-blue-600",
    ring: (isDark: boolean) => (isDark ? "hover:shadow-indigo-500/10" : "hover:shadow-indigo-200/50"),
  },
];

export default function SupportPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn("min-h-screen font-[Inter] transition-colors duration-300", isDark ? "bg-[#07030F] text-white" : "bg-white text-slate-900")}
    >
      <PlexusTerrainBackground />
      <GradientOrbs />
      <ScrollProgress className="bg-gradient-to-r from-amber-400 via-violet-500 to-fuchsia-500" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <PageHero
          icon={LifeBuoy}
          label="Support"
          badgeClass={isDark ? "border-amber-500/20 bg-amber-500/10 text-amber-300" : "border-amber-200 bg-amber-100 text-amber-700"}
          titleBefore={["How", "Can", "We"]}
          gradientWord="Help"
          titleAfter={["?"]}
          subtitle="Choose the best channel to reach us. We aim to respond within 24 hours."
          gradientClass="from-amber-400 via-violet-400 to-fuchsia-400"
          glowClass="rgba(245, 158, 11, 0.12)"
        />

        <div className="mb-12 grid gap-5 sm:grid-cols-3">
          {channels.map((ch, i) => {
            const Icon = ch.icon;
            return (
              <Reveal key={ch.title} delay={i * 0.07} y={30}>
                <Magnetic strength={0.3}>
                  <motion.a
                    href={ch.href}
                    target={ch.href.startsWith("http") ? "_blank" : undefined}
                    rel={ch.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className={cn("group relative block overflow-hidden rounded-2xl border p-6 text-center transition-shadow duration-300", glassCard(isDark), ch.ring(isDark))}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.06, 1] }}
                      transition={{ repeat: Infinity, duration: 3.5, delay: i * 0.5, ease: "easeInOut" }}
                      className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 blur-2xl"
                    />
                    <motion.div
                      whileHover={{ rotate: 12, scale: 1.12 }}
                      transition={{ type: "spring", stiffness: 400, damping: 14 }}
                      className={cn("mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md", ch.gradient)}
                    >
                      <Icon size={20} />
                    </motion.div>
                    <h3 className="mb-1 font-[Outfit] text-base font-bold">{ch.title}</h3>
                    <p className={cn("mb-3 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{ch.desc}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-violet-500 transition-all group-hover:gap-2 group-hover:text-violet-400">
                      {ch.action} <ArrowUpRight size={13} />
                    </span>
                  </motion.a>
                </Magnetic>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.15}>
          <SpotlightCard
            spotlightColor={isDark ? "rgba(245, 158, 11, 0.1)" : "rgba(245, 158, 11, 0.08)"}
            className={cn("rounded-2xl border", glassCard(isDark))}
            innerClassName="p-6 sm:p-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 14 }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500"
              >
                <FileQuestion size={22} />
              </motion.div>
              <div>
                <h3 className="mb-2 font-[Outfit] text-lg font-bold">Before you report...</h3>
                <ul className={cn("space-y-2 text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                  <motion.li
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <ExternalLink size={14} className="mt-0.5 shrink-0 text-violet-500" />
                    <span>
                      Check the <Link to="/faq" className="font-medium text-violet-500 transition-colors hover:text-violet-400">FAQ</Link> for common questions
                    </span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.18 }}
                    className="flex items-start gap-2"
                  >
                    <ExternalLink size={14} className="mt-0.5 shrink-0 text-violet-500" />
                    <span>
                      Search existing{" "}
                      <a href="https://github.com/anomalyco/opencode/issues" target="_blank" rel="noopener noreferrer" className="font-medium text-violet-500 transition-colors hover:text-violet-400">
                        GitHub Issues
                      </a>{" "}
                      to avoid duplicates
                    </span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.26 }}
                    className="flex items-start gap-2"
                  >
                    <ExternalLink size={14} className="mt-0.5 shrink-0 text-violet-500" />
                    <span>Include your browser, OS, and steps to reproduce when filing a bug</span>
                  </motion.li>
                </ul>
              </div>
            </div>
          </SpotlightCard>
        </Reveal>
      </div>

      <BackToTop />
    </motion.main>
  );
}
