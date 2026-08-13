import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientBorderProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  from?: string;
  to?: string;
  duration?: number;
  radius?: string;
}

export default function GradientBorder({
  children,
  className,
  innerClassName,
  from = "#8b5cf6",
  to = "#ec4899",
  duration = 7,
  radius = "1.25rem",
}: GradientBorderProps) {
  return (
    <div className={cn("relative overflow-hidden", className)} style={{ borderRadius: radius }}>
      <motion.div
        aria-hidden
        className="absolute -inset-[200%]"
        style={{
          background: `conic-gradient(from 0deg, transparent 0%, ${from} 10%, ${to} 20%, transparent 32%, transparent 55%, ${from} 66%, ${to} 78%, transparent 90%)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration, ease: "linear" }}
      />
      <div
        className={cn("relative m-[1.5px] overflow-hidden", innerClassName)}
        style={{ borderRadius: `calc(${radius} - 1.5px)` }}
      >
        {children}
      </div>
    </div>
  );
}
