import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

interface OrbConfig {
  className: string;
  size: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  floatDuration: number;
  factor: number;
  delay: number;
  blur: number;
}

const DEFAULT_ORBS: OrbConfig[] = [
  { className: "bg-violet-600/10", size: 680, top: "-14%", left: "50%", floatDuration: 13, factor: 30, delay: 0, blur: 170 },
  { className: "bg-fuchsia-600/10", size: 460, top: "6%", left: "3%", floatDuration: 9, factor: 42, delay: 1.4, blur: 130 },
  { className: "bg-cyan-500/10", size: 420, bottom: "2%", right: "4%", floatDuration: 11, factor: 36, delay: 0.7, blur: 120 },
  { className: "bg-pink-500/10", size: 300, top: "58%", left: "80%", floatDuration: 8, factor: 48, delay: 1.9, blur: 100 },
];

function Orb({ orb, mx, my }: { orb: OrbConfig; mx: MotionValue<number>; my: MotionValue<number> }) {
  const x = useTransform(mx, (v) => v * orb.factor);
  const y = useTransform(my, (v) => v * orb.factor);

  const style: React.CSSProperties = {
    width: orb.size,
    height: orb.size,
    filter: `blur(${orb.blur}px)`,
    ...(orb.top !== undefined ? { top: orb.top } : {}),
    ...(orb.bottom !== undefined ? { bottom: orb.bottom } : {}),
    ...(orb.left !== undefined ? { left: orb.left } : {}),
    ...(orb.right !== undefined ? { right: orb.right } : {}),
  };

  return (
    <motion.div style={{ x, y }} className="absolute">
      <motion.div
        animate={{ y: [0, -34, 0] }}
        transition={{ repeat: Infinity, duration: orb.floatDuration, ease: "easeInOut", delay: orb.delay }}
        className={`h-full w-full rounded-full ${orb.className}`}
        style={style}
      />
    </motion.div>
  );
}

export default function GradientOrbs({ orbs = DEFAULT_ORBS, className = "" }: { orbs?: OrbConfig[]; className?: string }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 42, damping: 18, mass: 0.9 });
  const sy = useSpring(my, { stiffness: 42, damping: 18, mass: 0.9 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 2);
      my.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <div className={`pointer-events-none fixed inset-0 overflow-hidden ${className}`} aria-hidden>
      {orbs.map((orb, i) => (
        <Orb key={i} orb={orb} mx={sx} my={sy} />
      ))}
    </div>
  );
}
