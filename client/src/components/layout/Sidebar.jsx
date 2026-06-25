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
 * Sidebar navigation component with active link highlighting.
 * Designed using clean brutalist principles: thin borders, solid background,
 * no glassmorphic blur, no gradients, and sharp square corner highlights.
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
      path: "/dashboard/deadlines",
      icon: Calendar,
      disabled: false,
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
      {/* Mobile Sidebar Backdrop (locks layout behind menu) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* Sidebar Container (Fixed 240px width, full height) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-border bg-panel transition-transform duration-150 ease-in-out lg:static lg:h-full lg:w-[240px] lg:translate-x-0 shrink-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header (Aligned perfectly with Top Navbar height: 72px) */}
        <div className="flex h-[72px] items-center justify-between px-6 shrink-0 border-b border-border bg-panel">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="font-display font-bold text-[15px] text-txt uppercase tracking-wider">
              CampusFlow
            </span>
          </div>
          
          <button
            onClick={onClose}
            className="rounded p-1 text-muted hover:bg-panel2 hover:text-txt lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-grow space-y-1.5 px-4 py-6 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            if (item.disabled) {
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between h-[42px] px-4 text-[13px] font-medium text-muted/40 cursor-not-allowed select-none"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4.5 w-4.5 flex-shrink-0 stroke-[1.75]" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-panel2 text-muted/45 border border-border/40">
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
                  `flex items-center justify-between h-[42px] px-4 text-[13px] font-medium transition-colors duration-150 ${
                    isActive
                      ? "bg-primary text-white rounded-[4px]"
                      : "text-muted hover:bg-panel2 hover:text-txt rounded-[4px]"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4.5 w-4.5 flex-shrink-0 stroke-[1.75]" />
                  <span>{item.name}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer (Pinned to bottom) */}
        <div className="p-4 border-t border-border bg-panel shrink-0">
          <p className="text-[11px] text-center text-muted uppercase tracking-widest font-semibold font-display">
            CampusFlow
          </p>
          <p className="text-[10px] text-center text-muted/65 mt-0.5">
            AI Study Workspace
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
