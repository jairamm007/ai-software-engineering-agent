import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  gradient?: string;
  index?: number;
}

export default function StatCard({
  title,
  value,
  icon,
  gradient = "accent-gradient",
  index = 0,
}: StatCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="cursor-default"
    >
      <div className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:shadow-lg ${
        isDark
          ? "border-slate-700 bg-slate-800/80"
          : "border-slate-200 bg-white shadow-sm shadow-slate-200/50"
      }`}>
        <div className={`absolute left-0 top-0 h-1 w-full ${gradient.startsWith('accent-') ? gradient : `bg-gradient-to-r ${gradient}`}`} />
        <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${gradient.startsWith('accent-') ? gradient : `bg-gradient-to-br ${gradient}`} opacity-10 blur-2xl`} />

        <div className="relative flex items-start justify-between">
          <div>
            <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {title}
            </p>
            <motion.p
              className={`mt-2 text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
              style={{ transform: "translateZ(20px)" }}
            >
              {value}
            </motion.p>
          </div>
          {icon && (
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${gradient.startsWith('accent-') ? gradient : `bg-gradient-to-br ${gradient}`} text-white shadow-md`}
              style={{ transform: "translateZ(15px)" }}
            >
              {icon}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
