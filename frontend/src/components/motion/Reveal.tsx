import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
  once?: boolean;
  blur?: boolean;
  duration?: number;
}

export default function Reveal({
  children,
  className = "",
  delay = 0,
  y = 26,
  x = 0,
  once = true,
  blur = false,
  duration = 0.6,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y: reduceMotion ? 0 : y,
        x: reduceMotion ? 0 : x,
        filter: blur && !reduceMotion ? "blur(10px)" : "blur(0px)",
      }}
      whileInView={{ opacity: 1, y: 0, x: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
