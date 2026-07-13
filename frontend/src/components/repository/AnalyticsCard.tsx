import { useTheme } from "@/context/ThemeContext";

interface Props {
  icon: string;
  label: string;
  value: string | number;
}

export default function AnalyticsCard({ icon, label, value }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${
      isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
    }`}>
      <p className="text-2xl">{icon}</p>
      <p className={`mt-3 text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
      <p className={`mt-1 text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}
