export const ACCENT_KEY = "wl-accent";
export const THEME_KEY = "wl-theme";
export const FONT_KEY = "wl-font";
export const DENSITY_KEY = "wl-density";

export const FONT_MAP: Record<string, string> = {
  "Inter (default)": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  "System UI": "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  "Mono": "'JetBrains Mono', 'Fira Code', monospace",
};

export const DENSITY_MAP: Record<string, string> = {
  Comfortable: "1rem",
  Compact: "0.75rem",
  Spacious: "1.25rem",
};

export const ACCENTS = [
  { id: "indigo",  label: "Indigo",  light: { accent: "#6366f1", accent2: "#8b5cf6", text: "#6366f1", glow: "rgba(99,102,241,0.20)"  }, dark: { accent: "#818cf8", accent2: "#a78bfa", text: "#a5b4fc", glow: "rgba(99,102,241,0.25)"  } },
  { id: "violet",  label: "Violet",  light: { accent: "#7c3aed", accent2: "#9333ea", text: "#7c3aed", glow: "rgba(124,58,237,0.20)" }, dark: { accent: "#a78bfa", accent2: "#c084fc", text: "#c4b5fd", glow: "rgba(167,139,250,0.25)" } },
  { id: "blue",    label: "Blue",    light: { accent: "#2563eb", accent2: "#3b82f6", text: "#2563eb", glow: "rgba(37,99,235,0.20)"  }, dark: { accent: "#60a5fa", accent2: "#93c5fd", text: "#93c5fd", glow: "rgba(96,165,250,0.25)"  } },
  { id: "emerald", label: "Emerald", light: { accent: "#059669", accent2: "#10b981", text: "#059669", glow: "rgba(5,150,105,0.20)"  }, dark: { accent: "#34d399", accent2: "#6ee7b7", text: "#6ee7b7", glow: "rgba(52,211,153,0.25)"  } },
  { id: "rose",    label: "Rose",    light: { accent: "#e11d48", accent2: "#f43f5e", text: "#e11d48", glow: "rgba(225,29,72,0.20)"  }, dark: { accent: "#fb7185", accent2: "#fda4af", text: "#fda4af", glow: "rgba(251,113,133,0.25)"  } },
];

export function applyAccent(id: string, isDark: boolean): void {
  const a = ACCENTS.find((x) => x.id === id) ?? ACCENTS[0];
  const tokens = isDark ? a.dark : a.light;
  const root = document.documentElement;
  root.style.setProperty("--accent",       tokens.accent);
  root.style.setProperty("--accent-2",     tokens.accent2);
  root.style.setProperty("--accent-text",  tokens.text);
  root.style.setProperty("--accent-glow",  tokens.glow);
  root.style.setProperty("--border-focus", tokens.accent + "80");
  localStorage.setItem(ACCENT_KEY, id);
}
