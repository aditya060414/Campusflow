import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import StudyBuddy from "../pages/StudyBuddy";
import NoticeAnalyzer from "../pages/NoticeAnalyzer";
import StudyBuddyFullscreen from "../pages/StudyBuddyFullscreen";
import DeadlineManager from "../pages/DeadlineManager";
import Attendance from "../pages/Attendance";
import DSAVisualizer from "../pages/DSAVisualizer";
import { StudyBuddyProvider } from "../context/StudyBuddyContext";

/**
 * Main application routing configuration.
 * Wraps the main dashboard and study buddy pages in the StudyBuddyProvider.
 */
export const AppRoutes = () => {
  return (
    <StudyBuddyProvider>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Standalone Fullscreen Study Workspace */}
        <Route path="/dashboard/study-buddy/fullscreen" element={<StudyBuddyFullscreen />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="study-buddy" element={<StudyBuddy />} />
          <Route path="notice-analyzer" element={<NoticeAnalyzer />} />
          <Route path="deadlines" element={<DeadlineManager />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="dsa" element={<DSAVisualizer />} />
        </Route>

        {/* Wildcard Fallback redirection */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </StudyBuddyProvider>
  );
};

export default AppRoutes;
