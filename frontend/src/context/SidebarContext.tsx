import { createContext, useContext, useState, useCallback, useMemo } from "react";

export type SidebarMode = "expanded" | "icons" | "hidden";

interface SidebarContextValue {
  mode: SidebarMode;
  setMode: (mode: SidebarMode) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  mode: "expanded",
  setMode: () => {},
  toggle: () => {},
});

const nextMode: Record<SidebarMode, SidebarMode> = {
  expanded: "icons",
  icons: "hidden",
  hidden: "expanded",
};

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<SidebarMode>(() => {
    const stored = localStorage.getItem("sidebar-mode");
    if (stored === "expanded" || stored === "icons" || stored === "hidden") return stored;
    return "expanded";
  });

  const setMode = useCallback((m: SidebarMode) => {
    setModeState(m);
    localStorage.setItem("sidebar-mode", m);
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const next = nextMode[prev];
      localStorage.setItem("sidebar-mode", next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ mode, setMode, toggle }), [mode, setMode, toggle]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
