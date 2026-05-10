import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "liquid-glass";

interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void;
  switchTheme?: (theme: Theme) => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = true,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes
    root.classList.remove("dark", "liquid-glass");
    
    // Add current theme class
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "liquid-glass") {
      root.classList.add("liquid-glass");
    }

    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, switchable]);

  const toggleTheme = switchable
    ? () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
      }
    : undefined;

  const switchTheme = switchable
    ? (newTheme: Theme) => {
        setTheme(newTheme);
      }
    : undefined;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, switchTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
