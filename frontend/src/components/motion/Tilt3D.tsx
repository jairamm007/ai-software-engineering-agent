import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tilt3DProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  /** Max tilt angle in degrees */
  maxTilt?: number;
  /** Hover scale */
  scale?: number;
  /** Show gradient glare that follows cursor */
  glare?: boolean;
  glareColor?: string;
  /** Show a soft spotlight that follows cursor */
  spotlight?: boolean;
  spotlightColor?: string;
  /** Perspective value for the parent wrapper */
  perspective?: number;
}

export default function Tilt3D({
  children,
  className,
  innerClassName,
  maxTilt = 10,
  scale = 1.015,
  glare = true,
  glareColor = "rgba(255,255,255,0.14)",
  spotlight = true,
  spotlightColor = "rgba(139, 92, 246, 0.12)",
  perspective = 1100,
}: Tilt3DProps) {
  const reduceMotion = useReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const rotateX = useSpring(useMotionValue(0), { stiffness: 140, damping: 18 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 140, damping: 18 });
  const scaleX = useSpring(useMotionValue(1), { stiffness: 200, damping: 24 });

  const glareBg = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, ${glareColor}, transparent 75%)`;
  const spotBg = useMotionTemplate`radial-gradient(340px circle at ${mx}px ${my}px, ${spotlightColor}, transparent 75%)`;

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;
    const yPct = (e.clientY - rect.top) / rect.height;

    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);

    if (!reduceMotion) {
      rotateX.set((0.5 - yPct) * maxTilt);
      rotateY.set((xPct - 0.5) * maxTilt);
      scaleX.set(scale);
    }
  };

  const onMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    scaleX.set(1);
  };

  return (
    <div className={cn("perspective-1200", className)} style={{ perspective }}>
      <motion.div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{
          rotateX,
          rotateY,
          scale: scaleX,
          transformStyle: "preserve-3d",
        }}
        className={cn("group preserve-3d relative h-full w-full", innerClassName)}
      >
        {/* Glare overlay */}
        {glare && !reduceMotion && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: glareBg }}
          />
        )}

        {/* Spotlight overlay */}
        {spotlight && !reduceMotion && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: spotBg }}
          />
        )}

        {children}
      </motion.div>
    </div>
  );
}
