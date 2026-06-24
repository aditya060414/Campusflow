import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  ClipboardList,
  Calendar,
  CheckSquare,
  Settings,
  X
} from "lucide-react";

/**
 * Sidebar navigation component with active link highlighting,
 * collapsible mobile states, and "Coming Soon" indicators.
 */
export const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      disabled: false,
    },
    {
      name: "Study Buddy",
      path: "/dashboard/study-buddy",
      icon: GraduationCap,
      disabled: false,
    },
    {
      name: "Notice Analyzer",
      path: "/dashboard/notice-analyzer",
      icon: ClipboardList,
      disabled: false,
    },
    {
      name: "Deadline Manager",
      path: "#",
      icon: Calendar,
      disabled: true,
      badge: "Soon",
    },
    {
      name: "Attendance",
      path: "#",
      icon: CheckSquare,
      disabled: true,
      badge: "Soon",
    },
    {
      name: "Settings",
      path: "#",
      icon: Settings,
      disabled: true,
    },
  ];

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 bg-gray-900/50 dark:bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Branding */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary dark:text-primary-400" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              CampusFlow <span className="text-xs font-normal text-gray-500">v1.0</span>
            </span>
          </div>
          
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            if (item.disabled) {
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-gray-400 dark:text-slate-600 cursor-not-allowed select-none"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-gray-100 text-gray-400 dark:bg-slate-900 dark:text-slate-600">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/dashboard"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/25 dark:bg-primary dark:text-white"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="p-6 border-t border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/20">
          <p className="text-xs text-center text-gray-400 dark:text-slate-500">
            CampusFlow Study Buddy
          </p>
          <p className="text-[10px] text-center text-gray-400 dark:text-slate-600 mt-0.5">
            Hackathon Edition
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
