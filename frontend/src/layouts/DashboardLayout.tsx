import type { ReactNode } from "react";

import Sidebar from "@/components/sidebar/Sidebar";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
      }}
    >
      <Sidebar />

      <main
        style={{
          flex: 1,
          padding: 40,
          background: "#f8fafc",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}