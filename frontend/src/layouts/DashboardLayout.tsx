import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

import Sidebar from "@/components/sidebar/Sidebar";
import TopBar from "@/components/layout/TopBar";
import ScrollToTop from "@/components/common/ScrollToTop";
import AuroraBackground from "@/components/motion/AuroraBackground";
import PageTransition from "@/components/motion/PageTransition";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const location = useLocation();

  return (
    <div className="app-bg relative flex h-screen overflow-hidden transition-colors duration-300">
      <AuroraBackground />
      <ScrollToTop />
      <Sidebar />

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <PageTransition locationKey={location.pathname} variant="3d">
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
