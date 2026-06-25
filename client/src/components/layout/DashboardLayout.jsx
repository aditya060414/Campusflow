import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import AiActionsFab from "../common/AiActionsFab";

/**
 * Layout wrapper for all dashboard sub-pages.
 * Establishes a single connected workspace with a fixed sidebar and main content.
 * Features a seamless T-junction alignment between the sidebar and top navbar.
 */
export const DashboardLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-txt font-body transition-colors duration-150">
      
      {/* 1. Sidebar Navigation (Fixed width on desktop, collapsible on mobile) */}
      <Sidebar isOpen={isMobileSidebarOpen} onClose={closeMobileSidebar} />

      {/* 2. Main content area (starts immediately beside the sidebar) */}
      <div className="flex-grow flex flex-col h-full overflow-hidden relative">
        
        {/* Top Navbar (Fixed height of 72px) */}
        <Navbar onMobileMenuToggle={toggleMobileSidebar} />
        
        {/* Scrollable Page Content (Consistent padding: 16px mobile, 20px tablet, 24px desktop) */}
        <main className="flex-grow overflow-y-auto p-4 sm:p-5 md:p-6 bg-bg">
          <div className="mx-auto max-w-[1400px] w-full">
            <Outlet />
          </div>
        </main>
        
      </div>

      {/* Global AI Actions Floating Action Button */}
      <AiActionsFab />
    </div>
  );
};

export default DashboardLayout;
