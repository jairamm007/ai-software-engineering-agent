import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  className?: string;
  /** @deprecated kept for API compatibility — background is now a flat surface */
  particles?: number;
  /** @deprecated kept for API compatibility — background is now a flat surface */
  hideGrid?: boolean;
}

export default function AuroraBackground({ className }: AuroraBackgroundProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none fixed inset-0", className)}
      style={{ backgroundColor: isDark ? "#0a0a0f" : "#f6f5fb" }}
    />
  );
}
