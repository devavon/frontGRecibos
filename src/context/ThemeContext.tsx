"use client";

import type React from "react";
import { createContext, useContext, useEffect } from "react";

// El sistema de diseño Garnier (Gpeople) es solo tema claro: el blanco es
// protagonista. Se conserva la API del contexto para no romper componentes
// heredados que llaman a useTheme(), pero siempre es "light".
type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    // Limpia un modo oscuro guardado por versiones anteriores
    document.documentElement.classList.remove("dark");
    try {
      localStorage.removeItem("theme");
    } catch {
      /* sin storage */
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "light", toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
