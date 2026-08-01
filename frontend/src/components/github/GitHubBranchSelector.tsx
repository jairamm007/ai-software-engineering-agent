import { GitBranch, ChevronDown } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import type { GitHubBranch as BranchType } from "@/types/github-integration";

interface GitHubBranchSelectorProps {
  branches: BranchType[];
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
}

export default function GitHubBranchSelector({
  branches,
  selectedBranch,
  onBranchChange,
}: GitHubBranchSelectorProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="relative">
      <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
        isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-white text-slate-900"
      }`}>
        <GitBranch size={14} className={isDark ? "text-slate-400" : "text-slate-500"} />
        <select
          value={selectedBranch}
          onChange={(e) => onBranchChange(e.target.value)}
          className="appearance-none bg-transparent pr-6 text-sm outline-none"
        >
          {branches.map((b) => (
            <option key={b.name} value={b.name}>
              {b.name} {b.isDefault ? "(default)" : ""} {b.protected ? "🔒" : ""}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className={`absolute right-2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
      </div>
    </div>
  );
}
