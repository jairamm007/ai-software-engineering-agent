import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { Users, Building2, GraduationCap, Rocket, Code2, Shield } from "lucide-react";

const useCases = [
  {
    icon: Users,
    title: "Open Source Maintainers",
    description: "Review PRs faster, maintain code quality, and onboard new contributors with AI-powered documentation.",
    gradient: "from-violet-500 to-purple-600",
    stat: "10x",
    statLabel: "faster reviews",
  },
  {
    icon: Building2,
    title: "Enterprise Teams",
    description: "Scale code reviews across large teams. Ensure consistency, catch security issues, and track code health.",
    gradient: "from-fuchsia-500 to-pink-600",
    stat: "60%",
    statLabel: "less review time",
  },
  {
    icon: GraduationCap,
    title: "Computer Science Students",
    description: "Understand complex codebases, learn best practices, and get instant explanations for any part of the code.",
    gradient: "from-cyan-500 to-blue-600",
    stat: "3x",
    statLabel: "faster learning",
  },
  {
    icon: Rocket,
    title: "Startups",
    description: "Ship faster with AI code reviews, auto-generated docs, and architecture insights from day one.",
    gradient: "from-emerald-500 to-teal-600",
    stat: "2x",
    statLabel: "faster shipping",
  },
  {
    icon: Code2,
    title: "Freelance Developers",
    description: "Deliver higher quality code, impress clients with auto-generated documentation and architecture diagrams.",
    gradient: "from-orange-500 to-red-600",
    stat: "40%",
    statLabel: "more productivity",
  },
  {
    icon: Shield,
    title: "Security Engineers",
    description: "Automated security scanning, vulnerability detection, and compliance checks across all repositories.",
    gradient: "from-amber-500 to-yellow-600",
    stat: "100%",
    statLabel: "coverage",
  },
];

export default function UseCases() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section id="use-cases" className="px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness: 200 }}
            className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${
              isDark ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-emerald-200 bg-emerald-100 text-emerald-700"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Who It's For
          </motion.span>
          <h2 className={`mt-5 font-[Outfit] text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl ${isDark ? "" : "text-slate-900"}`}>
            Built for{" "}
            <span className={`${isDark ? "bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400" : "bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600"} bg-clip-text text-transparent`}>
              Every Developer
            </span>
          </h2>
          <p className={`mx-auto mt-6 max-w-2xl text-lg font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Whether you're a solo developer or part of a 500-person team, Repo Verify adapts to your workflow.
          </p>
        </motion.div>

        {/* Use case cards */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {useCases.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, margin: "-40px" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`group relative overflow-hidden rounded-2xl border p-6 transition-shadow duration-300 sm:p-7 ${
                  isDark
                    ? "border-white/[0.06] bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-violet-500/5"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xl"
                }`}
              >
                {/* Background gradient on hover */}
                <div className={`absolute -top-20 -right-20 h-40 w-40 bg-gradient-to-br ${item.gradient} rounded-full opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`} />

                <div className="relative">
                  <div className="flex items-start justify-between mb-5">
                    <div className={`inline-flex rounded-xl bg-gradient-to-br ${item.gradient} p-3 shadow-lg`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <div className="text-right">
                      <div className={`font-[Outfit] text-2xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>{item.stat}</div>
                      <div className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{item.statLabel}</div>
                    </div>
                  </div>

                  <h3 className={`mb-2 font-[Outfit] text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm leading-relaxed font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
