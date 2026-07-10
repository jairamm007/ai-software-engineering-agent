import type { ReactNode } from "react";

import Sidebar from "@/components/sidebar/Sidebar";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: Props) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}