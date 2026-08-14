import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { Info, TrendingUp, TrendingDown } from "lucide-react";
import AnimatedNumber from "@/components/motion/AnimatedNumber";
import { cn } from "@/lib/utils";

type Tone = "violet" | "blue" | "cyan" | "emerald" | "amber" | "rose";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  /** Color tone. Tied to meaning: violet = primary objects, blue/cyan = data,
      emerald = healthy/active, amber = needs attention, rose = blocked/error. */
  tone?: Tone;
  index?: number;
  infoContent?: React.ReactNode;
  /** Optional trend text, e.g. "+12%" or "-3 this week" */
  delta?: { label: string; direction: "up" | "down" | "flat" };
  /** Optional status chip, e.g. "Active" or "Setup required" */
  status?: string;
}

function toneStyles(isDark: boolean): Record<Tone, { badge: string; text: string; blob: string; shadow: string; chip: string }> {
  return {
    violet: {
      badge: isDark ? "bg-violet-500/20" : "bg-violet-500/10",
      text: isDark ? "text-violet-300" : "text-violet-600",
      blob: isDark ? "bg-violet-500/20" : "bg-violet-500/15",
      shadow: isDark ? "shadow-[0_0_22px_rgba(139,92,246,0.28)]" : "shadow-[0_8px_22px_rgba(109,77,224,0.18)]",
      chip: isDark ? "bg-violet-500/15 text-violet-300" : "bg-violet-500/10 text-violet-600",
    },
    blue: {
      badge: isDark ? "bg-blue-500/20" : "bg-blue-500/10",
      text: isDark ? "text-blue-300" : "text-blue-600",
      blob: isDark ? "bg-blue-500/20" : "bg-blue-500/15",
      shadow: isDark ? "shadow-[0_0_22px_rgba(59,130,246,0.28)]" : "shadow-[0_8px_22px_rgba(47,99,216,0.18)]",
      chip: isDark ? "bg-blue-500/15 text-blue-300" : "bg-blue-500/10 text-blue-600",
    },
    cyan: {
      badge: isDark ? "bg-cyan-500/20" : "bg-cyan-500/10",
      text: isDark ? "text-cyan-300" : "text-cyan-600",
      blob: isDark ? "bg-cyan-500/20" : "bg-cyan-500/15",
      shadow: isDark ? "shadow-[0_0_22px_rgba(34,211,238,0.25)]" : "shadow-[0_8px_22px_rgba(8,145,178,0.16)]",
      chip: isDark ? "bg-cyan-500/15 text-cyan-300" : "bg-cyan-500/10 text-cyan-600",
    },
    emerald: {
      badge: isDark ? "bg-emerald-500/20" : "bg-emerald-500/10",
      text: isDark ? "text-emerald-300" : "text-emerald-600",
      blob: isDark ? "bg-emerald-500/20" : "bg-emerald-500/15",
      shadow: isDark ? "shadow-[0_0_22px_rgba(16,185,129,0.25)]" : "shadow-[0_8px_22px_rgba(13,154,110,0.16)]",
      chip: isDark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-500/10 text-emerald-600",
    },
    amber: {
      badge: isDark ? "bg-amber-500/20" : "bg-amber-500/10",
      text: isDark ? "text-amber-300" : "text-amber-600",
      blob: isDark ? "bg-amber-500/20" : "bg-amber-500/15",
      shadow: isDark ? "shadow-[0_0_22px_rgba(245,166,35,0.22)]" : "shadow-[0_8px_22px_rgba(217,119,6,0.16)]",
      chip: isDark ? "bg-amber-500/15 text-amber-300" : "bg-amber-500/10 text-amber-600",
    },
    rose: {
      badge: isDark ? "bg-rose-500/20" : "bg-rose-500/10",
      text: isDark ? "text-rose-300" : "text-rose-600",
      blob: isDark ? "bg-rose-500/20" : "bg-rose-500/15",
      shadow: isDark ? "shadow-[0_0_22px_rgba(244,63,94,0.25)]" : "shadow-[0_8px_22px_rgba(225,29,72,0.16)]",
      chip: isDark ? "bg-rose-500/15 text-rose-300" : "bg-rose-500/10 text-rose-600",
    },
  };
}

export default function StatCard({
  title,
  value,
  icon,
  tone = "violet",
  index = 0,
  infoContent,
  delta,
  status,
}: StatCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [showInfo, setShowInfo] = useState(false);
  const t = toneStyles(isDark)[tone];

  const numeric = typeof value === "number" && Number.isFinite(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="perspective-1000 h-full"
    >
      <motion.div
        whileHover={{ y: -6, rotateX: 5, rotateY: -4, scale: 1.015 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        style={{ transformStyle: "preserve-3d", backgroundColor: "var(--card-bg)" }}
        className={cn(
          "preserve-3d group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[var(--card-border)] p-6 shadow-sm transition-all duration-300 hover:shadow-xl cursor-default",
          isDark
            ? "hover:border-white/15 hover:shadow-black/40"
            : "hover:border-slate-300 hover:shadow-slate-300/40"
        )}
      >
        {/* Tone blob — color is reserved for meaning, not decoration */}
        <div
          className={cn(
            "absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-150",
            t.blob
          )}
        />
        {/* Animated sheen */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className={cn("text-sm font-medium", isDark ? "text-slate-400" : "text-slate-500")}>
                {title}
              </p>
              {status && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    t.chip
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {status}
                </span>
              )}
            </div>
            <p
              className={cn(
                "mt-2 text-3xl font-bold tracking-tight",
                isDark ? "text-white" : "text-slate-900"
              )}
              style={{ transform: "translateZ(24px)" }}
            >
              {numeric ? (
                <AnimatedNumber value={value as number} />
              ) : (
                value
              )}
            </p>
            {delta && (
              <p className="mt-1.5 flex items-center gap-1 text-xs">
                {delta.direction === "up" && (
                  <TrendingUp size={13} className={isDark ? "text-emerald-400" : "text-emerald-600"} />
                )}
                {delta.direction === "down" && (
                  <TrendingDown size={13} className={isDark ? "text-rose-400" : "text-rose-600"} />
                )}
                {delta.direction === "flat" && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                <span className={isDark ? "text-slate-500" : "text-slate-500"}>{delta.label}</span>
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2" style={{ transform: "translateZ(18px)" }}>
            {icon && (
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                  t.badge,
                  t.text,
                  t.shadow
                )}
              >
                {icon}
              </div>
            )}
            {infoContent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInfo(!showInfo);
                }}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                  showInfo
                    ? t.badge
                    : isDark
                      ? "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                )}
              >
                <Info size={14} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {showInfo && infoContent && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className={cn(
            "mt-2 overflow-hidden rounded-xl border p-4 text-sm shadow-sm",
            isDark
              ? "border-slate-700 bg-slate-800/90 text-slate-300"
              : "border-slate-200 bg-white text-slate-600"
          )}
        >
          {infoContent}
        </motion.div>
      )}
    </motion.div>
  );
}
