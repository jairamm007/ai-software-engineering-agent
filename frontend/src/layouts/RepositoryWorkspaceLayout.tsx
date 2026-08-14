import type { ReactNode } from "react";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  sidebar: ReactNode;
  content: ReactNode;
}

export default function RepositoryWorkspaceLayout({
  sidebar,
  content,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="grid grid-cols-12 gap-6">
      <aside className="col-span-3">
        {sidebar}
      </aside>

      <section className={`col-span-9 space-y-6 rounded-2xl border p-6 shadow-sm ${
        isDark ? "border-white/[0.06] surface-card" : "border-slate-200/60 bg-white"
      }`}>
        {content}
      </section>
    </div>
  );
}
