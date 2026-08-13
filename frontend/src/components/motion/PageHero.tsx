import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface Stat {
  icon: LucideIcon;
  label: string;
  value: string;
}

interface PageHeroProps {
  icon: LucideIcon;
  label: string;
  badgeClass: string;
  titleBefore: string[];
  gradientWord: string;
  gradientWords?: string[];
  titleAfter?: string[];
  subtitle: string;
  gradientClass: string;
  glowClass?: string;
  stats?: Stat[];
}

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 44, filter: "blur(12px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: 0.18 + i * 0.11, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function PageHero({
  icon: Icon,
  label,
  badgeClass,
  titleBefore,
  gradientWord,
  gradientWords: gradientWordsProp,
  titleAfter = [],
  subtitle,
  gradientClass,
  glowClass = "rgba(139, 92, 246, 0.16)",
  stats,
}: PageHeroProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const gradientWords = gradientWordsProp?.length ? gradientWordsProp : [gradientWord];
  const words = [...titleBefore, ...gradientWords, ...titleAfter];

  return (
    <div className="relative mb-16 text-center">
      {/* Ambient hero glow */}
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[380px] w-[720px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ background: `radial-gradient(closest-side, ${glowClass}, transparent 70%)` }}
      />

      <motion.div initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }} className="mb-9">
        <Link
          to="/"
          className={`group inline-flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
        >
          <motion.span animate={{ x: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="inline-flex">
            <ArrowLeft size={16} />
          </motion.span>
          Back to Home
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.6, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 220, damping: 16 }}
        className={cn("mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium", badgeClass)}
      >
        <motion.div
          animate={{ rotate: [0, 12, 0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut" }}
          className="inline-flex"
        >
          <Icon size={14} />
        </motion.div>
        {label}
        <motion.span
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="h-1.5 w-1.5 rounded-full bg-emerald-400"
        />
      </motion.div>

      <h1 className="mx-auto max-w-4xl font-[Outfit] text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
        {words.map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            custom={i}
            variants={wordVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              "mr-[0.28em] inline-block",
              (word === gradientWord || gradientWords.includes(word)) &&
                `bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_auto]`
            )}
          >
            {word}
          </motion.span>
        ))}
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn("mx-auto mt-6 max-w-2xl text-lg leading-relaxed", isDark ? "text-slate-400" : "text-slate-500")}
      >
        {subtitle}
      </motion.p>

      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-3 sm:gap-5"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05 + i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, scale: 1.05 }}
              className={cn(
                "rounded-2xl border px-3 py-4 backdrop-blur-xl sm:px-5 sm:py-5",
                isDark ? "border-white/[0.08] bg-white/[0.04]" : "border-slate-200/70 bg-white/60"
              )}
            >
              <stat.icon size={18} className={cn("mx-auto mb-1.5", isDark ? "text-slate-400" : "text-slate-500")} />
              <div className="font-[Outfit] text-lg font-extrabold sm:text-xl">{stat.value}</div>
              <div className={cn("mt-0.5 text-[11px] sm:text-xs", isDark ? "text-slate-500" : "text-slate-400")}>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
