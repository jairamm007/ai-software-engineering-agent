import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const orbs = [
  { size: 500, x: -150, y: -100, color: "bg-purple-600/10", blur: 120, dur: 24 },
  { size: 400, x: 100, y: 80, color: "bg-blue-500/8", blur: 100, dur: 20 },
  { size: 300, x: -30, y: -50, color: "bg-fuchsia-500/6", blur: 90, dur: 28 },
  { size: 250, x: 80, y: -100, color: "bg-cyan-400/5", blur: 80, dur: 22 },
];

const lightOrbs = [
  { size: 500, x: -150, y: -100, color: "bg-purple-300/15", blur: 120, dur: 24 },
  { size: 400, x: 100, y: 80, color: "bg-blue-300/12", blur: 100, dur: 20 },
  { size: 300, x: -30, y: -50, color: "bg-fuchsia-300/10", blur: 90, dur: 28 },
  { size: 250, x: 80, y: -100, color: "bg-cyan-300/8", blur: 80, dur: 22 },
];

const stars = Array.from({ length: 30 }, (_, index) => ({
  id: index,
  size: Math.random() * 2 + 0.5,
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: 3 + Math.random() * 4,
  delay: Math.random() * 5,
}));

export default function AnimatedBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const activeOrbs = isDark ? orbs : lightOrbs;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Slow-moving gradient orbs */}
      {activeOrbs.map((orb, i) => (
        <motion.div
          key={i}
          animate={{
            x: [0, i % 2 === 0 ? 60 : -60, 0],
            y: [0, i % 2 === 0 ? 40 : -40, 0],
          }}
          transition={{ repeat: Infinity, duration: orb.dur, ease: "easeInOut" }}
          className={`absolute rounded-full ${orb.color}`}
          style={{ width: orb.size, height: orb.size, left: orb.x, top: orb.y, filter: `blur(${orb.blur}px)` }}
        />
      ))}

      {/* Twinkling stars (dark mode only) */}
      {isDark && (
        <div className="absolute inset-0">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                width: star.size,
                height: star.size,
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationDuration: `${star.duration}s`,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
