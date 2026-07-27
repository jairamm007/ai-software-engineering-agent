import type { ReactNode } from "react";

import Sidebar from "@/components/sidebar/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${
      isDark
        ? "bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950"
        : "bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50"
    }`}>
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto animate-fadeIn p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
