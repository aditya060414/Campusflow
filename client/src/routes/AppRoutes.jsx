import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import DashboardLayout from "../components/layout/DashboardLayout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import StudyBuddy from "../pages/StudyBuddy";
import NoticeAnalyzer from "../pages/NoticeAnalyzer";
import StudyBuddyFullscreen from "../pages/StudyBuddyFullscreen";
import DeadlineManager from "../pages/DeadlineManager";
import Attendance from "../pages/Attendance";
import DSAVisualizer from "../pages/DSAVisualizer";
import { StudyBuddyProvider } from "../context/StudyBuddyContext";
import { useAuth } from "../hooks/useAuth";

// Guard guest-only routes (redirect authenticated students to dashboard)
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

/**
 * Main application routing configuration.
 * Configures guest routes and protected dashboard sub-routes.
 * Wrapped in StudyBuddyProvider to maintain synchronized state globally.
 */
export const AppRoutes = () => {
  return (
    <StudyBuddyProvider>
      <Routes>
        {/* Public Guest Routes */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />

        {/* Standalone Fullscreen Study Workspace */}
        <Route
          path="/dashboard/study-buddy/fullscreen"
          element={
            <ProtectedRoute>
              <StudyBuddyFullscreen />
            </ProtectedRoute>
          }
        />

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
          
          {/* /dashboard/deadlines */}
          <Route path="deadlines" element={<DeadlineManager />} />

          {/* /dashboard/attendance */}
          <Route path="attendance" element={<Attendance />} />

          {/* /dashboard/dsa */}
          <Route path="dsa" element={<DSAVisualizer />} />
        </Route>

        {/* Wildcard Fallback redirection */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </StudyBuddyProvider>
  );
};

export default AppRoutes;
