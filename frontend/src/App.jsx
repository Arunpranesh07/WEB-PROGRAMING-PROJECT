import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import FloatingChatbot from './components/chatbot/FloatingChatbot';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Resident Pages
import ResidentDashboardPage from './pages/resident/ResidentDashboardPage';
import SubmitComplaintPage from './pages/resident/SubmitComplaintPage';
import TrackComplaintPage from './pages/resident/TrackComplaintPage';
import ComplaintHistoryPage from './pages/resident/ComplaintHistoryPage';
import WaterSupplyPage from './pages/resident/WaterSupplyPage';
import NotificationsPage from './pages/resident/NotificationsPage';
import CommunityMapPage from './pages/resident/CommunityMapPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ComplaintManagementPage from './pages/admin/ComplaintManagementPage';
import StaffManagementPage from './pages/admin/StaffManagementPage';
import SupplyManagementPage from './pages/admin/SupplyManagementPage';
import AnnouncementsPage from './pages/admin/AnnouncementsPage';
import ReportsPage from './pages/admin/ReportsPage';

const AppLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Resident Protected Routes */}
          <Route
            path="/resident/dashboard"
            element={
              <ProtectedRoute requiredRole="resident">
                <ResidentDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/submit"
            element={
              <ProtectedRoute requiredRole="resident">
                <SubmitComplaintPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/track"
            element={
              <ProtectedRoute requiredRole="resident">
                <TrackComplaintPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/history"
            element={
              <ProtectedRoute requiredRole="resident">
                <ComplaintHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/supply"
            element={
              <ProtectedRoute requiredRole="resident">
                <WaterSupplyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/map"
            element={
              <ProtectedRoute requiredRole="resident">
                <CommunityMapPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute requiredRole="admin">
                <ComplaintManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <ProtectedRoute requiredRole="admin">
                <StaffManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/supply"
            element={
              <ProtectedRoute requiredRole="admin">
                <SupplyManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/announcements"
            element={
              <ProtectedRoute requiredRole="admin">
                <AnnouncementsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute requiredRole="admin">
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Floating Chatbot Assistant for logged in users */}
      {user && <FloatingChatbot />}

      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <AppLayout />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
