import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import DashboardLayout from "../components/layout/DashboardLayout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import StudyBuddy from "../pages/StudyBuddy";
import NoticeAnalyzer from "../pages/NoticeAnalyzer";

/**
 * Main application routing configuration.
 * Configures guest routes and protected dashboard sub-routes.
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Guest Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* /dashboard */}
        <Route index element={<Dashboard />} />
        
        {/* /dashboard/study-buddy */}
        <Route path="study-buddy" element={<StudyBuddy />} />
        
        {/* /dashboard/notice-analyzer */}
        <Route path="notice-analyzer" element={<NoticeAnalyzer />} />
      </Route>

      {/* Wildcard Fallback redirection */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
