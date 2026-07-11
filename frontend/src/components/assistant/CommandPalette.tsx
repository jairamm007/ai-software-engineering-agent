import { Command } from "cmdk";

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
  const handleSelect = (action: CommandAction) => {
    onSelect(action);
    onClose();
  };

  return (
    <div
      aria-label="Close AI command palette"
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/45 px-4 pt-24"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <Command
        aria-label="AI command palette"
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        loop
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <span className="font-semibold">AI Commands</span>
          <span className="rounded border border-slate-300 px-2 py-0.5 text-xs text-slate-500 dark:border-slate-600 dark:text-slate-400">
            Ctrl + K
          </span>
        </div>
        <Command.Input
          autoFocus
          className="w-full border-b border-slate-200 bg-transparent px-4 py-3 outline-none placeholder:text-slate-400 dark:border-slate-700"
          placeholder="Search AI commands..."
        />
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-sm text-slate-500">
            No commands found.
          </Command.Empty>
          {commands.map((command) => (
            <Command.Item
              key={command.action}
              className="cursor-pointer rounded-lg px-3 py-2.5 text-sm outline-none data-[selected=true]:bg-blue-600 data-[selected=true]:text-white"
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
