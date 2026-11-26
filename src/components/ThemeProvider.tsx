"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { applyAccent, ACCENT_KEY, THEME_KEY, FONT_KEY, DENSITY_KEY, FONT_MAP, DENSITY_MAP } from "@/lib/theme";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  font: string;
  setFont: (f: string) => void;
  density: string;
  setDensity: (d: string) => void;
  accent: string;
  setAccent: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark", toggle: () => {},
  font: "Inter (default)", setFont: () => {},
  density: "Comfortable", setDensity: () => {},
  accent: "indigo", setAccent: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme]     = useState<Theme>("light");
  const [font, setFontState]  = useState("Inter (default)");
  const [density, setDensityState] = useState("Comfortable");
  const [accent, setAccentState]   = useState("indigo");

  useEffect(() => {
    const storedTheme   = (localStorage.getItem(THEME_KEY) as Theme | null) ?? "light";
    const storedFont    = localStorage.getItem(FONT_KEY)    ?? "Inter (default)";
    const storedDensity = localStorage.getItem(DENSITY_KEY) ?? "Comfortable";
    const storedAccent  = localStorage.getItem(ACCENT_KEY)  ?? "indigo";

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(storedTheme);
    setFontState(storedFont);
    setDensityState(storedDensity);
    setAccentState(storedAccent);

    document.documentElement.classList.toggle("dark", storedTheme === "dark");
    document.documentElement.style.setProperty("--font-family", FONT_MAP[storedFont] ?? FONT_MAP["Inter (default)"]);
    document.documentElement.style.setProperty("--density-spacing", DENSITY_MAP[storedDensity] ?? DENSITY_MAP["Comfortable"]);
    applyAccent(storedAccent, storedTheme === "dark");
    // Enable theme transitions only after initial values are applied
    document.documentElement.classList.add("theme-ready");
  }, []);

  function toggle() {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      document.documentElement.classList.toggle("dark", next === "dark");
      applyAccent(accent, next === "dark");
      return next;
    });
  }

  function setFont(f: string) {
    setFontState(f);
    localStorage.setItem(FONT_KEY, f);
    document.documentElement.style.setProperty("--font-family", FONT_MAP[f] ?? FONT_MAP["Inter (default)"]);
  }

  function setDensity(d: string) {
    setDensityState(d);
    localStorage.setItem(DENSITY_KEY, d);
    document.documentElement.style.setProperty("--density-spacing", DENSITY_MAP[d] ?? DENSITY_MAP["Comfortable"]);
  }

  function setAccent(id: string) {
    setAccentState(id);
    applyAccent(id, theme === "dark");
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle, font, setFont, density, setDensity, accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}
