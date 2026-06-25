import React from "react";
import { Menu, LogOut, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

/**
 * Top Navbar component.
 * Fixed height of 72px with a solid bg-panel background and thin border.
 * Aligns perfectly with the sidebar and matches the viewport layout grid.
 */
export const Navbar = ({ onMobileMenuToggle }) => {
  const { student, logout } = useAuth();

  return (
    <header className="h-[72px] w-full border-b border-border bg-panel shrink-0 box-border transition-colors duration-150 relative z-40">
      <div className="flex h-full items-center justify-between px-6">
        
        {/* Left: Mobile Sidebar Trigger & Workspace Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            type="button"
            className="rounded p-1.5 text-muted hover:bg-panel2 hover:text-txt lg:hidden focus:outline-none border border-border"
            aria-label="Open sidebar"
          >
            <Menu className="h-4.5 w-4.5 stroke-[1.75]" />
          </button>
          
          <div className="flex items-center gap-2.5">
            {/* Desktop Active Workspace Tag */}
            <span className="hidden lg:inline-block px-2.5 py-0.5 text-[10px] font-bold rounded bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider font-display">
              AI Command Center
            </span>
            {/* Mobile Brand Name */}
            <span className="lg:hidden text-[16px] font-bold text-txt font-display uppercase tracking-wider">
              Campus<span className="text-primary">Flow</span>
            </span>
          </div>
        </div>

        {/* Right: User Profile and Logout */}
        <div className="flex items-center gap-4">
          {/* User Profile Info Card */}
          {student && (
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-[13px] font-semibold text-txt font-display">
                  {student.name}
                </span>
                <span className="text-[9px] text-muted uppercase tracking-widest font-bold">
                  Student
                </span>
              </div>
              
              {/* User Avatar Icon Box */}
              <div className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-primary/10 text-primary border border-primary/20 shrink-0">
                <User className="h-4.5 w-4.5 stroke-[1.75]" />
              </div>

              {/* Logout Trigger */}
              <button
                onClick={logout}
                type="button"
                className="rounded p-1.5 text-muted hover:bg-danger/10 hover:text-danger border border-transparent hover:border-danger/10 transition-colors duration-150 focus:outline-none"
                title="Log out"
              >
                <LogOut className="h-4.5 w-4.5 stroke-[1.75]" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
