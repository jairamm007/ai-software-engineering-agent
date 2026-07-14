import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";
type Accent = "violet" | "blue" | "emerald" | "amber" | "rose";

interface ThemeContextValue {
  theme: Theme;
  accent: Accent;
  toggleTheme: () => void;
  setAccent: (accent: Accent) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  accent: "violet",
  toggleTheme: () => {},
  setAccent: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const [accent, setAccentState] = useState<Accent>(() => {
    const saved = localStorage.getItem("accent");
    if (saved === "violet" || saved === "blue" || saved === "emerald" || saved === "amber" || saved === "rose") return saved;
    return "violet";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-accent", accent);
    localStorage.setItem("accent", accent);
  }, [accent]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  const setAccent = useCallback((a: Accent) => setAccentState(a), []);

  return (
    <ThemeContext.Provider value={{ theme, accent, toggleTheme, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
