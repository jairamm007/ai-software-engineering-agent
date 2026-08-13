import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress({ className = "bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500" }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX }}
      className={`fixed inset-x-0 top-0 z-[60] h-[3px] origin-left shadow-[0_0_12px_rgba(168,85,247,0.5)] ${className}`}
    />
  );
}
