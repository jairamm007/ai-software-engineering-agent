import type { ReactNode } from "react";
import { motion } from "framer-motion";

import Sidebar from "@/components/sidebar/Sidebar";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${
      isDark
        ? "bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950"
        : "bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50"
    }`}>
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
