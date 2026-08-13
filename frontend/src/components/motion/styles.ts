export function glassCard(isDark: boolean) {
  return isDark
    ? "border-white/[0.08] bg-white/[0.04] backdrop-blur-xl"
    : "border-slate-200/70 bg-white/60 backdrop-blur-xl";
}
