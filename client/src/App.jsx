import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

/**
 * Root application component.
 * Wraps the application with global Providers, routing context,
 * and mounts the global toast notification layout.
 */
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {/* Global Toaster Configuration for Premium Light/Dark Theme matching */}
          <Toaster
            position="top-right"
            toastOptions={{
              className: "dark:bg-slate-850 dark:text-white transition-colors duration-200",
              style: {
                borderRadius: "10px",
                background: "var(--toast-bg)",
                color: "var(--toast-color)",
              },
              success: {
                duration: 3000,
              },
              error: {
                duration: 4000,
              },
            }}
          />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
