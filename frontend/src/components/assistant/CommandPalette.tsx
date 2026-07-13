import { Command } from "cmdk";
import { useTheme } from "@/context/ThemeContext";

export type CommandAction =
  | "explain"
  | "review"
  | "fix"
  | "security"
  | "tests"
  | "commit"
  | "pr"
  | "docs";

interface Props {
  onClose: () => void;
  onSelect: (action: CommandAction) => void;
}

const commands: Array<{ action: CommandAction; label: string }> = [
  { action: "explain", label: "Explain File" },
  { action: "review", label: "Review File" },
  { action: "fix", label: "Suggest Fix" },
  { action: "security", label: "Security Scan" },
  { action: "tests", label: "Generate Tests" },
  { action: "commit", label: "Generate Commit" },
  { action: "pr", label: "Generate Pull Request" },
  { action: "docs", label: "Generate Documentation" },
];

export default function CommandPalette({ onClose, onSelect }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleSelect = (action: CommandAction) => {
    onSelect(action);
    onClose();
  };

  return (
    <div
      aria-label="Close AI command palette"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-24"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <Command
        aria-label="AI command palette"
        className={`w-full max-w-2xl overflow-hidden rounded-xl border shadow-2xl ${
          isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
        }`}
        loop
      >
        <div className={`flex items-center justify-between border-b px-4 py-3 ${
          isDark ? "border-white/10" : "border-slate-200"
        }`}>
          <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>AI Commands</span>
          <span className={`rounded border px-2 py-0.5 text-xs ${
            isDark ? "border-white/20 text-slate-400" : "border-slate-300 text-slate-500"
          }`}>
            Ctrl + K
          </span>
        </div>
        <Command.Input
          autoFocus
          className={`w-full border-b bg-transparent px-4 py-3 outline-none ${
            isDark
              ? "border-white/10 text-white placeholder:text-slate-500"
              : "border-slate-200 placeholder:text-slate-400"
          }`}
          placeholder="Search AI commands..."
        />
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className={`px-3 py-6 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            No commands found.
          </Command.Empty>
          {commands.map((command) => (
            <Command.Item
              key={command.action}
              className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm outline-none ${
                isDark
                  ? "text-slate-200 data-[selected=true]:bg-violet-600 data-[selected=true]:text-white"
                  : "text-slate-700 data-[selected=true]:bg-violet-600 data-[selected=true]:text-white"
              }`}
              onSelect={() => handleSelect(command.action)}
              value={command.label}
            >
              {command.label}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </div>
  );
}
