"use client";

import * as React from "react";

type Theme = "dark" | "light" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  themes: Theme[];
}

const ThemeContext = React.createContext<ThemeContextType>({
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => null,
  themes: ["dark", "light", "system"],
});

function getSystemThemeSnapshot(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribeSystemTheme(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "ncloth-theme",
  attribute = "class",
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey) as Theme | null;
      if (stored) return stored;
    }
    return defaultTheme;
  });

  const systemTheme: "dark" | "light" = React.useSyncExternalStore<"dark" | "light">(
    subscribeSystemTheme,
    getSystemThemeSnapshot,
    () => "dark"
  );

  const resolvedTheme: "dark" | "light" =
    (theme === "system" ? systemTheme : theme) === "light" ? "light" : "dark";

  // DOM sync effect - purely updates external DOM class
  React.useEffect(() => {
    const root = document.documentElement;

    if (disableTransitionOnChange) {
      root.classList.add("[&_*]:!transition-none");
    }

    if (attribute === "class") {
      root.classList.remove("light", "dark");
      root.classList.add(resolvedTheme);
    } else {
      root.setAttribute(attribute, resolvedTheme);
    }

    if (disableTransitionOnChange) {
      const timer = window.setTimeout(() => {
        root.classList.remove("[&_*]:!transition-none");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [resolvedTheme, attribute, disableTransitionOnChange]);

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch {
        // Ignore storage restrictions
      }
      setThemeState(newTheme);
    },
    [storageKey]
  );

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      themes: ["dark", "light", "system"] as Theme[],
    }),
    [theme, resolvedTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
