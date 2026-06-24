import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

/**
 * Layout wrapper for all dashboard sub-pages.
 * Manages responsive grids, collapsible menu states,
 * and maintains consistent background colors.
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
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. Sidebar Navigation */}
      <Sidebar isOpen={isMobileSidebarOpen} onClose={closeMobileSidebar} />

      {/* 2. Main content area (shifted right on desktop) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        
        {/* Top Navbar */}
        <Navbar onMobileMenuToggle={toggleMobileSidebar} />
        
        {/* Scrollable Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="mx-auto max-w-7xl w-full">
            <Outlet />
          </div>
        </main>
        
      </div>
    </div>
  );
};

export default DashboardLayout;
