"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setThemeMode: (themeMode: ThemeMode) => void;
};

const STORAGE_KEY = "regcheck-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function getSystemTheme(): ResolvedTheme {
  if (globalThis.window === undefined) {
    return "dark";
  }

  return globalThis.window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("dark");

  useEffect(() => {
    const browserWindow = globalThis.window;
    const storedTheme = browserWindow.localStorage.getItem(STORAGE_KEY);
    const nextThemeMode = isThemeMode(storedTheme) ? storedTheme : "dark";

    setThemeMode(nextThemeMode);
    setSystemTheme(getSystemTheme());
  }, []);

  useEffect(() => {
    if (themeMode !== "system") {
      return;
    }

    const browserWindow = globalThis.window;
    const mediaQuery = browserWindow.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    };

    updateSystemTheme();
    mediaQuery.addEventListener("change", updateSystemTheme);

    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, [themeMode]);

  useEffect(() => {
    const resolvedTheme = themeMode === "system" ? systemTheme : themeMode;
    const root = document.documentElement;
    const browserWindow = globalThis.window;

    root.dataset.theme = resolvedTheme;
    root.dataset.themeMode = themeMode;
    root.style.colorScheme = resolvedTheme;
    browserWindow.localStorage.setItem(STORAGE_KEY, themeMode);
  }, [systemTheme, themeMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeMode,
      resolvedTheme: themeMode === "system" ? systemTheme : themeMode,
      setThemeMode,
    }),
    [systemTheme, themeMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
