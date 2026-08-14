import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import Reveal from "@/components/motion/Reveal";
import SpotlightCard from "@/components/motion/SpotlightCard";
import Magnetic from "@/components/motion/Magnetic";
import PageHero from "@/components/motion/PageHero";
import ScrollProgress from "@/components/motion/ScrollProgress";
import BackToTop from "@/components/motion/BackToTop";
import { glassCard } from "@/components/motion/styles";
import { Link } from "react-router-dom";
import { LifeBuoy, Code2, CheckCircle2, FileQuestion, ExternalLink, ArrowUpRight, BookOpen, History } from "lucide-react";

const channels = [
  {
    icon: Code2,
    title: "GitHub Issues",
    desc: "The best place to report bugs, request features, or track known issues for Repo Verify.",
    points: [
      "Report bugs with clear steps to reproduce",
      "Request new features and improvements",
      "Browse and follow existing issues",
    ],
    action: "Open GitHub Issues",
    href: "https://github.com/jairamm007/ai-software-engineering-agent/issues",
    gradient: "from-slate-500 to-slate-700",
    ring: (isDark: boolean) => (isDark ? "hover:shadow-slate-500/10" : "hover:shadow-slate-300/50"),
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
      <ScrollProgress className="bg-gradient-to-r from-amber-400 via-violet-500 to-fuchsia-500" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <PageHero
          icon={LifeBuoy}
          label="Support"
          badgeClass={isDark ? "border-amber-500/20 bg-amber-500/10 text-amber-300" : "border-amber-200 bg-amber-100 text-amber-700"}
          titleBefore={["How", "Can", "We"]}
          gradientWord="Help"
          titleAfter={["?"]}
          subtitle="Report bugs, request features, or browse known issues — all on our GitHub."
          gradientClass="from-amber-400 via-violet-400 to-fuchsia-400"
          glowClass="rgba(245, 158, 11, 0.12)"
        />

        <div className="mb-12 grid gap-5">
          {channels.map((ch, i) => {
            const Icon = ch.icon;
            return (
              <Reveal key={ch.title} delay={i * 0.07} y={30}>
                <Magnetic strength={0.3}>
                  <motion.a
                    href={ch.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className={cn("group relative block overflow-hidden rounded-2xl border p-8 transition-shadow duration-300", glassCard(isDark), ch.ring(isDark))}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.06, 1] }}
                      transition={{ repeat: Infinity, duration: 3.5, delay: i * 0.5, ease: "easeInOut" }}
                      className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 blur-2xl"
                    />
                    <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                      <motion.div
                        whileHover={{ rotate: 12, scale: 1.12 }}
                        transition={{ type: "spring", stiffness: 400, damping: 14 }}
                        className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md", ch.gradient)}
                      >
                        <Icon size={26} />
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <h3 className="mb-1 font-[Outfit] text-xl font-bold">{ch.title}</h3>
                        <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>{ch.desc}</p>
                        <ul className={cn("mt-4 space-y-2 text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                          {ch.points.map((point) => (
                            <li key={point} className="flex items-start gap-2">
                              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-slate-500 to-slate-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all group-hover:scale-105 group-hover:shadow-lg">
                        {ch.action} <ArrowUpRight size={15} />
                      </span>
                    </div>
                  </motion.a>
                </Magnetic>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1} className="mb-12">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { to: "/faq", icon: FileQuestion, label: "FAQ", desc: "Common questions answered" },
              { to: "/docs", icon: BookOpen, label: "Documentation", desc: "Guides & API reference" },
              { to: "/changelog", icon: History, label: "Changelog", desc: "See what's new" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn("group flex items-center gap-3 rounded-xl border p-4 transition-all duration-300 hover:-translate-y-1", glassCard(isDark))}
              >
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-100 text-amber-600")}>
                  <link.icon size={16} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{link.label}</span>
                  <span className={cn("block truncate text-xs", isDark ? "text-slate-500" : "text-slate-400")}>{link.desc}</span>
                </span>
                <ArrowUpRight size={14} className={cn("ml-auto shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5", isDark ? "text-slate-500" : "text-slate-400")} />
              </Link>
            ))}
          </div>
        </Reveal>

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
                      <a href="https://github.com/jairamm007/ai-software-engineering-agent/issues" target="_blank" rel="noopener noreferrer" className="font-medium text-violet-500 transition-colors hover:text-violet-400">
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
