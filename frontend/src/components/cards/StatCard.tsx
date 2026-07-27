import { useState, useCallback, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Info } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  gradient?: string;
  index?: number;
  infoContent?: React.ReactNode;
}

export default function StatCard({
  title,
  value,
  icon,
  gradient = "accent-gradient",
  index = 0,
  infoContent,
}: StatCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [showInfo, setShowInfo] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: yPct * -12, y: xPct * 12 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.15s ease-out",
        animationDelay: `${index * 0.1}s`,
      }}
      className="opacity-0 animate-fadeInUp cursor-default"
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
            <p
              className={`mt-2 text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
              style={{ transform: "translateZ(20px)" }}
            >
              {value}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {infoContent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInfo(!showInfo);
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  showInfo
                    ? "accent-bg-light accent-text-base"
                    : isDark
                      ? "text-slate-400 hover:bg-slate-700 hover:text-slate-300"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                }`}
              >
                <Info size={16} />
              </button>
            )}
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
      </div>

      {showInfo && infoContent && (
        <div className={`mt-2 overflow-hidden rounded-xl border p-4 text-sm shadow-sm animate-fadeIn ${
          isDark
            ? "border-slate-700 bg-slate-800/90 text-slate-300"
            : "border-slate-200 bg-white text-slate-600"
        }`}>
          {infoContent}
        </div>
      )}
    </div>
  );
}
