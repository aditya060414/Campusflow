import React, { createContext, useEffect } from "react";

export const ThemeContext = createContext(null);

/**
 * ThemeProvider – locked to dark mode.
 * Always applies the `dark` class on <html> so that any remaining
 * Tailwind utilities resolve correctly in the locked dark theme.
 */
export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    window.document.documentElement.classList.add("dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "dark", isDarkMode: true }}>
      {children}
    </ThemeContext.Provider>
  );
};
