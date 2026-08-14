import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import Reveal from "@/components/motion/Reveal";
import SpotlightCard from "@/components/motion/SpotlightCard";
import TiltCard from "@/components/motion/TiltCard";
import Magnetic from "@/components/motion/Magnetic";
import PageHero from "@/components/motion/PageHero";
import ScrollProgress from "@/components/motion/ScrollProgress";
import BackToTop from "@/components/motion/BackToTop";
import CTACard from "@/components/motion/CTACard";
import { glassCard } from "@/components/motion/styles";
import { Heart, GitPullRequest, Code2, MessageCircle, Shield, ExternalLink, ListChecks, Rocket } from "lucide-react";

const guidelines = [
  {
    icon: GitPullRequest,
    title: "Pull Requests",
    desc: "Fork the repo, create a feature branch, and submit a PR against `main`. We aim to review within 48 hours. Keep PRs focused — one feature or fix per PR.",
  },
  {
    icon: Code2,
    title: "Code Style",
    desc: "We use TypeScript with strict mode, ESLint, and Prettier. Run `npm run lint` before submitting. Follow existing patterns in the codebase.",
  },
  {
    icon: MessageCircle,
    title: "Communication",
    desc: "Open an issue first for large features. For bugs, include reproduction steps, browser/OS info, and screenshots if applicable.",
  },
  {
    icon: Shield,
    title: "Code of Conduct",
    desc: "Be respectful, constructive, and inclusive. We follow the Contributor Covenant. Harassment or discrimination of any kind will not be tolerated.",
  },
];

const goodFirstIssues = [
  "Add keyboard shortcuts for repository navigation",
  "Implement dark/light theme toggle animation",
  "Add export options for documentation (PDF, HTML)",
  "Improve mobile responsiveness for dashboard sidebar",
  "Add loading skeleton placeholders for repository list",
];

export default function CareersPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn("min-h-screen font-[Inter] transition-colors duration-300", isDark ? "bg-[#07030F] text-white" : "bg-white text-slate-900")}
    >
      <ScrollProgress className="bg-gradient-to-r from-pink-500 via-violet-500 to-fuchsia-500" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <PageHero
          icon={Heart}
          label="Contribute"
          badgeClass={isDark ? "border-pink-500/20 bg-pink-500/10 text-pink-300" : "border-pink-200 bg-pink-100 text-pink-700"}
          titleBefore={["Build", "with"]}
          gradientWord="Us"
          subtitle="Repo Verify is open source. We welcome contributions from developers of all skill levels."
          gradientClass="from-pink-400 via-violet-400 to-fuchsia-400"
          glowClass="rgba(236, 72, 153, 0.13)"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          {guidelines.map((g, i) => {
            const Icon = g.icon;
            return (
              <Reveal key={g.title} delay={0.08 + i * 0.1} y={30} className="h-full">
                <TiltCard glareOpacity={0.08} tiltMax={5} scale={1.015}>
                  <SpotlightCard
                    spotlightColor={isDark ? "rgba(236, 72, 153, 0.14)" : "rgba(236, 72, 153, 0.1)"}
                    className={cn("h-full rounded-2xl border transition-shadow duration-300", glassCard(isDark), isDark ? "hover:shadow-xl hover:shadow-pink-500/10" : "hover:shadow-xl hover:shadow-slate-200/60")}
                    innerClassName="h-full p-6"
                  >
                    <motion.div
                      whileHover={{ rotate: 12, scale: 1.12 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="mb-4 inline-flex"
                    >
                      <span className={cn("flex h-12 w-12 items-center justify-center rounded-xl border", isDark ? "border-pink-500/20 bg-pink-500/10" : "border-pink-200 bg-pink-100")}>
                        <Icon size={20} className="text-pink-500" />
                      </span>
                    </motion.div>
                    <h3 className="font-[Outfit] text-base font-bold">{g.title}</h3>
                    <p className={cn("mt-2 text-sm leading-relaxed", isDark ? "text-slate-400" : "text-slate-500")}>{g.desc}</p>
                  </SpotlightCard>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1} className="mt-12">
          <SpotlightCard
            spotlightColor={isDark ? "rgba(236, 72, 153, 0.1)" : "rgba(236, 72, 153, 0.08)"}
            className={cn("rounded-2xl border", glassCard(isDark))}
            innerClassName="p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 8, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className={cn("flex h-11 w-11 items-center justify-center rounded-xl", isDark ? "bg-pink-500/10" : "bg-pink-100")}
              >
                <Rocket size={20} className="text-pink-500" />
              </motion.div>
              <h2 className="font-[Outfit] text-xl font-bold">How to Contribute</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { title: "Fork & Clone", desc: "Fork the repository and clone it locally with git clone." },
                { title: "Create a Branch", desc: "Cut a feature branch, make your changes, and commit them." },
                { title: "Open a PR", desc: "Push your branch and submit a pull request against main." },
              ].map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -4 }}
                  className={cn("relative rounded-xl border p-5", isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-200/70 bg-white/50")}
                >
                  <motion.span
                    whileHover={{ scale: 1.2, rotate: 8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 12 }}
                    className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500 text-xs font-bold text-white shadow-md shadow-pink-500/20"
                  >
                    {i + 1}
                  </motion.span>
                  <h3 className="font-[Outfit] text-sm font-bold">{step.title}</h3>
                  <p className={cn("mt-1.5 text-xs leading-relaxed", isDark ? "text-slate-400" : "text-slate-500")}>{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </SpotlightCard>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <SpotlightCard
            spotlightColor="rgba(236, 72, 153, 0.1)"
            className={cn("rounded-2xl border", glassCard(isDark))}
            innerClassName="p-8"
          >
            <div className="mb-2 flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 8, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className={cn("flex h-11 w-11 items-center justify-center rounded-xl", isDark ? "bg-pink-500/10" : "bg-pink-100")}
              >
                <ListChecks size={20} className="text-pink-500" />
              </motion.div>
              <h2 className="font-[Outfit] text-xl font-bold">Good First Issues</h2>
            </div>
            <p className={cn("mb-5 text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
              Looking for a place to start? These issues are tagged for new contributors:
            </p>
            <ul className="space-y-2.5">
              {goodFirstIssues.map((issue, i) => (
                <motion.li
                  key={issue}
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: 0.05 + i * 0.08, duration: 0.45 }}
                  whileHover={{ x: 6, scale: 1.01 }}
                  className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 text-sm", isDark ? "border-white/[0.06] bg-[var(--card-bg)] text-slate-300" : "border-slate-200/70 bg-white/50 text-slate-600")}
                >
                  <motion.span
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.25 }}
                    className="h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-pink-500 to-violet-500"
                  />
                  {issue}
                </motion.li>
              ))}
            </ul>
          </SpotlightCard>
        </Reveal>

        <CTACard
          title="Ready to contribute?"
          subtitle="Star the repo, pick an issue, and open your first PR today."
          from="#ec4899"
          to="#8b5cf6"
          icon={<Heart size={24} />}
          action={
            <Magnetic>
              <motion.a
                href="https://github.com/jairamm007/ai-software-engineering-agent"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-shadow hover:shadow-xl hover:shadow-violet-500/40"
              >
                <Code2 size={16} /> View Repository <ExternalLink size={14} />
              </motion.a>
            </Magnetic>
          }
        />
      </div>

      <BackToTop />
    </motion.main>
  );
}
