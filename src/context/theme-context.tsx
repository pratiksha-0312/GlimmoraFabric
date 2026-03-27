"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

type Theme = "dark" | "light";

const ACCENT_COLORS: Record<string, string> = {
  "sky-blue": "14, 165, 233",
  "ocean-blue": "74, 127, 168",
  teal: "20, 184, 166",
  emerald: "16, 185, 129",
  "forest-green": "74, 143, 106",
  "indigo-navy": "99, 102, 241",
  "royal-purple": "123, 104, 165",
  "rose-pink": "225, 29, 72",
  "crimson-red": "165, 72, 74",
  orange: "234, 88, 12",
  "amber-gold": "217, 119, 6",
  "coffee-brown": "139, 105, 20",
  terracotta: "165, 120, 101",
  "slate-gray": "107, 123, 141",
};

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [accentColor, setAccentColorState] = useState("amber-gold");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("glimmora-theme") as Theme | null;
    if (stored) setTheme(stored);
    const storedAccent = localStorage.getItem("glimmora-accent");
    if (storedAccent) setAccentColorState(storedAccent);
    setMounted(true);
  }, []);

  // Apply theme class
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("glimmora-theme", theme);
  }, [theme, mounted]);

  // Apply accent color CSS variables
  useEffect(() => {
    if (!mounted) return;
    const rgb = ACCENT_COLORS[accentColor] || ACCENT_COLORS["amber-gold"];
    const root = document.documentElement;
    root.setAttribute("data-color-theme", accentColor);
    root.style.setProperty("--gf-accent", `rgb(${rgb})`);
    root.style.setProperty("--gf-accent-rgb", rgb);
    root.style.setProperty("--gf-accent-bg", `rgba(${rgb}, 0.12)`);
    root.style.setProperty("--gf-accent-bg-hover", `rgba(${rgb}, 0.18)`);
    localStorage.setItem("glimmora-accent", accentColor);
  }, [accentColor, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setAccentColor = useCallback((color: string) => {
    setAccentColorState(color);
  }, []);

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
