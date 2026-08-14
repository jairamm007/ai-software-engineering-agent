import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  fallback?: string;
}

export default function BackButton({ fallback = "/repositories" }: Props) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`mb-6 flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium shadow-sm transition ${
        isDark
          ? "border-white/20 bg-[var(--card-bg)] text-slate-200 hover:bg-white/10"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
      }`}
    >
      <ArrowLeft size={18} />
      Back
    </button>
  );
}
