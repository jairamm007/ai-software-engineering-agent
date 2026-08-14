import type { ReactNode } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: ReactNode;
  /** Key to trigger transition on change (e.g. location.pathname) */
  locationKey: string;
  variant?: "fade" | "slide-up" | "scale" | "blur" | "3d";
  className?: string;
}

const variants: Record<string, Variants> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  "slide-up": {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.01 },
  },
  blur: {
    initial: { opacity: 0, filter: "blur(8px)", y: 10 },
    animate: { opacity: 1, filter: "blur(0px)", y: 0 },
    exit: { opacity: 0, filter: "blur(8px)", y: -10 },
  },
  "3d": {
    initial: { opacity: 0, rotateX: 8, y: 30, scale: 0.97 },
    animate: { opacity: 1, rotateX: 0, y: 0, scale: 1 },
    exit: { opacity: 0, rotateX: -6, y: -20, scale: 0.99 },
  },
};

const transition = { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const };

export default function PageTransition({
  children,
  locationKey,
  variant = "slide-up",
  className,
}: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={locationKey}
        variants={variants[variant]}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
        className={cn(
          variant === "3d" && "perspective-1200 preserve-3d [transform-style:preserve-3d]",
          className
        )}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
