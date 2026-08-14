import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  /** Rounded corners */
  rounded?: string;
  /** Enable gradient border glow */
  gradientBorder?: boolean;
  /** Enable animated conic border */
  animatedBorder?: boolean;
  /** Soft spotlight that follows cursor */
  spotlight?: boolean;
  spotlightColor?: string;
  /** Hover lift distance (px) */
  lift?: number;
  /** Enable 3D perspective tilt on hover (max tilt angle in degrees) */
  tilt?: boolean | number;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className,
  rounded = "rounded-2xl",
  gradientBorder = false,
  animatedBorder = false,
  spotlight = true,
  spotlightColor = "rgba(139, 92, 246, 0.10)",
  lift = 6,
  tilt = false,
  onClick,
}: GlassCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const reduceMotion = useReducedMotion();

  const maxTilt = typeof tilt === "number" ? tilt : 7;
  const tiltEnabled = !!tilt && !reduceMotion;

  const mx = useMotionValue(-500);
  const my = useMotionValue(-500);
  const sx = useSpring(mx, { stiffness: 140, damping: 22 });
  const sy = useSpring(my, { stiffness: 140, damping: 22 });
  const spot = useMotionTemplate`radial-gradient(360px circle at ${sx}px ${sy}px, ${spotlightColor}, transparent 72%)`;

  const rotateX = useSpring(useMotionValue(0), { stiffness: 180, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 180, damping: 20 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mx.set(x);
    my.set(y);
    if (tiltEnabled) {
      rotateY.set((x / rect.width - 0.5) * maxTilt * 2);
      rotateX.set((0.5 - y / rect.height) * maxTilt * 2);
    }
  };

  const onMouseLeave = () => {
    mx.set(-500);
    my.set(-500);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileHover={{ y: -lift }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn("group relative overflow-hidden", rounded, tiltEnabled && "preserve-3d perspective-1000")}
    >
      <motion.div
        style={{
          backgroundColor: "var(--card-bg)",
          transformStyle: "preserve-3d",
          rotateX,
          rotateY,
        }}
        className={cn(
          "relative h-full w-full rounded-[inherit] border border-[var(--card-border)] p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg",
          isDark
            ? "hover:border-white/15 hover:shadow-black/40"
            : "hover:border-slate-300 hover:shadow-slate-300/40",
          gradientBorder && "gradient-border",
          animatedBorder && "animated-border",
          className
        )}
      >
        {spotlight && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: spot }}
          />
        )}
        <div className="relative z-10">{children}</div>
      </motion.div>
    </motion.div>
  );
}
