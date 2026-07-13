import { useTheme } from "@/context/ThemeContext";

interface Props {
  x: number;
  y: number;
  label: string;
  onAction: (action: string) => void;
}

const actions = ["Explain", "Review", "Generate tests for", "Run a security scan on", "Suggest a fix for"];

export default function GraphContextMenu({ x, y, label, onAction }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      style={{ left: x, top: y }}
      className={`fixed z-50 w-48 rounded-xl border p-2 shadow-xl ${
        isDark ? "border-white/10 bg-slate-800" : "border-slate-200 bg-white"
      }`}
    >
      <p className={`truncate px-2 py-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
      {actions.map((action) => (
        <button
          key={action}
          onClick={() => onAction(action)}
          className={`block w-full rounded-lg px-2 py-2 text-left text-sm ${
            isDark ? "text-slate-200 hover:bg-white/10" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          {action}
        </button>
      ))}
    </div>
  );
}
