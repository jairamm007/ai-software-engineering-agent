import { useTheme } from "@/context/ThemeContext";

const ACCENT_MAP = {
  violet: {
    bg: "bg-violet-500",
    bgLight: "bg-violet-500/15",
    bgLightDark: "bg-violet-500/10",
    text: "text-violet-500",
    textHover: "hover:text-violet-400",
    textHoverDark: "hover:text-violet-600",
    border: "border-violet-500",
    ring: "ring-violet-500/20",
    gradient: "from-violet-600 to-fuchsia-600",
    gradientShadow: "shadow-violet-500/25",
    hoverShadow: "hover:shadow-violet-500/30",
  },
  blue: {
    bg: "bg-blue-500",
    bgLight: "bg-blue-500/15",
    bgLightDark: "bg-blue-500/10",
    text: "text-blue-500",
    textHover: "hover:text-blue-400",
    textHoverDark: "hover:text-blue-600",
    border: "border-blue-500",
    ring: "ring-blue-500/20",
    gradient: "from-blue-600 to-cyan-600",
    gradientShadow: "shadow-blue-500/25",
    hoverShadow: "hover:shadow-blue-500/30",
  },
  emerald: {
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-500/15",
    bgLightDark: "bg-emerald-500/10",
    text: "text-emerald-500",
    textHover: "hover:text-emerald-400",
    textHoverDark: "hover:text-emerald-600",
    border: "border-emerald-500",
    ring: "ring-emerald-500/20",
    gradient: "from-emerald-600 to-teal-600",
    gradientShadow: "shadow-emerald-500/25",
    hoverShadow: "hover:shadow-emerald-500/30",
  },
  amber: {
    bg: "bg-amber-500",
    bgLight: "bg-amber-500/15",
    bgLightDark: "bg-amber-500/10",
    text: "text-amber-500",
    textHover: "hover:text-amber-400",
    textHoverDark: "hover:text-amber-600",
    border: "border-amber-500",
    ring: "ring-amber-500/20",
    gradient: "from-amber-500 to-orange-600",
    gradientShadow: "shadow-amber-500/25",
    hoverShadow: "hover:shadow-amber-500/30",
  },
  rose: {
    bg: "bg-rose-500",
    bgLight: "bg-rose-500/15",
    bgLightDark: "bg-rose-500/10",
    text: "text-rose-500",
    textHover: "hover:text-rose-400",
    textHoverDark: "hover:text-rose-600",
    border: "border-rose-500",
    ring: "ring-rose-500/20",
    gradient: "from-rose-500 to-pink-600",
    gradientShadow: "shadow-rose-500/25",
    hoverShadow: "hover:shadow-rose-500/30",
  },
} as const;

export type AccentColors = (typeof ACCENT_MAP)[keyof typeof ACCENT_MAP];

export function useAccent(): AccentColors {
  const { accent } = useTheme();
  return ACCENT_MAP[accent];
}
