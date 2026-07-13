import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const orbs = [
  { size: 600, x: -200, y: -200, color: "bg-purple-600/20", blur: 140, dur: 20, scale: [1, 1.2, 1] },
  { size: 500, x: 150, y: 100, color: "bg-blue-500/20", blur: 120, dur: 18, scale: [1, 1.15, 1] },
  { size: 350, x: -50, y: -80, color: "bg-fuchsia-500/15", blur: 100, dur: 22, scale: [1, 1.3, 1] },
  { size: 280, x: 100, y: -150, color: "bg-cyan-400/15", blur: 90, dur: 16, scale: [1, 1.25, 1] },
];

const lightOrbs = [
  { size: 600, x: -200, y: -200, color: "bg-purple-300/30", blur: 140, dur: 20, scale: [1, 1.2, 1] },
  { size: 500, x: 150, y: 100, color: "bg-blue-300/25", blur: 120, dur: 18, scale: [1, 1.15, 1] },
  { size: 350, x: -50, y: -80, color: "bg-fuchsia-300/20", blur: 100, dur: 22, scale: [1, 1.3, 1] },
  { size: 280, x: 100, y: -150, color: "bg-cyan-300/20", blur: 90, dur: 16, scale: [1, 1.25, 1] },
];

const stars = Array.from({ length: 100 }, (_, index) => ({
  id: index,
  size: Math.random() * 3 + 0.5,
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: 2 + Math.random() * 4,
  delay: Math.random() * 5,
}));

export default function AnimatedBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const activeOrbs = isDark ? orbs : lightOrbs;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ perspective: "1200px" }}>
      {activeOrbs.map((orb, i) => (
        <motion.div
          key={i}
          animate={{
            x: [0, i % 2 === 0 ? 80 : -80, 0],
            y: [0, i % 2 === 0 ? 60 : -60, 0],
            scale: orb.scale,
            rotateX: [0, 15, 0],
            rotateY: [0, -15, 0],
          }}
          transition={{ repeat: Infinity, duration: orb.dur, ease: "easeInOut" }}
          className={`absolute rounded-full ${orb.color}`}
          style={{ width: orb.size, height: orb.size, left: orb.x, top: orb.y, filter: `blur(${orb.blur}px)`, transformStyle: "preserve-3d" }}
        />
      ))}

      {isDark && stars.map((star) => (
        <motion.div
          key={star.id}
          animate={{ opacity: [0.1, 0.9, 0.1], scale: [1, 1.5, 1] }}
          transition={{ repeat: Infinity, duration: star.duration, delay: star.delay }}
          className="absolute rounded-full bg-white"
          style={{ width: star.size, height: star.size, left: `${star.left}%`, top: `${star.top}%` }}
        />
      ))}

      {isDark && (
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            transform: "perspective(500px) rotateX(60deg) translateY(-100px) scale(2)",
            transformOrigin: "center top",
          }}
        />
      )}
    </div>
  );
}
