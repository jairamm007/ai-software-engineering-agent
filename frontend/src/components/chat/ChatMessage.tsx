import MarkdownMessage from "./MarkdownMessage";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  role: "user" | "assistant" | "system";
  message: string;
}

export default function ChatMessage({ role, message }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`mb-5 flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-4xl rounded-xl px-5 py-4 shadow ${
          role === "user"
            ? "bg-blue-600 text-white"
            : isDark
              ? "border border-white/10 bg-[var(--bg-secondary)] text-slate-200"
              : "border border-slate-200 bg-white text-slate-800"
        }`}
      >
        <MarkdownMessage content={message} />
      </div>
    </div>
  );
}
