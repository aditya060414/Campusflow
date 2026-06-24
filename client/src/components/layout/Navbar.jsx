import React from "react";
import { Menu, LogOut, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import ThemeToggle from "../common/ThemeToggle";

/**
 * Sticky, responsive navbar containing page actions,
 * user status, theme toggle, and mobile menu trigger.
 */
export const Navbar = ({ onMobileMenuToggle }) => {
  const { student, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-slate-800 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md transition-colors duration-300">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Left: Mobile Sidebar Trigger & Brand Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMobileMenuToggle}
            type="button"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300 lg:hidden focus:outline-none"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-primary dark:text-primary-400">
              Campus<span className="text-gray-900 dark:text-white">Flow</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-400">
              AI Study Buddy
            </span>
          </div>
        </div>

        {/* Right: Theme Toggle, User Indicator, and Logout */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* User Profile Card */}
          {student && (
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-slate-800">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {student.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  ID: {student.student_id}
                </span>
              </div>
              
              {/* User Icon Avatar */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary-900/30 dark:text-primary-400">
                <User className="h-5 w-5" />
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                type="button"
                className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors duration-200 focus:outline-none"
                title="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
