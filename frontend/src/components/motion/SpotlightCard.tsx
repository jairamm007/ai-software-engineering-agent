import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  spotlightColor?: string;
  spotSize?: number;
}

export default function SpotlightCard({
  children,
  className,
  innerClassName,
  spotlightColor = "rgba(139, 92, 246, 0.14)",
  spotSize = 340,
}: SpotlightCardProps) {
  const mx = useMotionValue(-500);
  const my = useMotionValue(-500);
  const sx = useSpring(mx, { stiffness: 160, damping: 24 });
  const sy = useSpring(my, { stiffness: 160, damping: 24 });
  const spot = useMotionTemplate`radial-gradient(${spotSize}px circle at ${sx}px ${sy}px, ${spotlightColor}, transparent 75%)`;

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={() => {
        mx.set(-500);
        my.set(-500);
      }}
      className={cn("group relative overflow-hidden", className)}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: spot }}
      />
      <div className={cn("relative z-10", innerClassName)}>{children}</div>
    </motion.div>
  );
}
