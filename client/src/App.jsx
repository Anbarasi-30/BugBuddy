/**
 * App.jsx — Root application component
 * 
 * Sets up routing, context providers, and protected routes.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ArcadeProvider } from './context/ArcadeContext';
import BugBuddyLogo from './components/BugBuddyLogo';

// Layouts
import AppLayout from './layouts/AppLayout';
import AdminLayout from './layouts/AdminLayout';
import AdminRoute from './components/AdminRoute';

// Public & Student Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpVerificationPage from './pages/OtpVerificationPage';
import DashboardPage from './pages/DashboardPage';
import ProblemsPage from './pages/ProblemsPage';
import WorkspacePage from './pages/WorkspacePage';
import HistoryPage from './pages/HistoryPage';
import MistakesPage from './pages/MistakesPage';
import SkillsPage from './pages/SkillsPage';
import ProfilePage from './pages/ProfilePage';
import FeedbackPage from './pages/FeedbackPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import NotFoundPage from './pages/NotFoundPage';

// Arcade Pages
import ArcadePage from './pages/ArcadePage';
import ArcadeGamePage from './pages/ArcadeGamePage';
import ArcadeShopPage from './pages/ArcadeShopPage';
import ArcadeLeaderboardPage from './pages/ArcadeLeaderboardPage';

// Admin Pages
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminSubmissionsPage from './pages/admin/AdminSubmissionsPage';
import AdminProblemsPage from './pages/admin/AdminProblemsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSystemPage from './pages/admin/AdminSystemPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

/**
 * ProtectedRoute — redirects to /login if user is not authenticated.
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: '1.5rem',
          background: 'var(--bg-primary)',
        }}
      >
        <BugBuddyLogo size={72} showWordmark={true} tagline={true} />
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * PublicOnlyRoute — redirects to /dashboard if already logged in.
 */
function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ArcadeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <RegisterPage />
                </PublicOnlyRoute>
              }
            />
            <Route path="/verify-otp" element={<OtpVerificationPage />} />

            {/* Google OAuth callback — reads token from URL hash */}
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Protected student application routes — inside AppLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/problems" element={<ProblemsPage />} />
              <Route path="/workspace" element={<WorkspacePage />} />
              <Route path="/workspace/:problemId" element={<WorkspacePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/mistakes" element={<MistakesPage />} />
              <Route path="/skills" element={<SkillsPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Arcade Routes */}
              <Route path="/arcade" element={<ArcadePage />} />
              <Route path="/arcade/:gameId" element={<ArcadeGamePage />} />
              <Route path="/arcade/shop" element={<ArcadeShopPage />} />
              <Route path="/arcade/leaderboard" element={<ArcadeLeaderboardPage />} />
            </Route>

            {/* Admin Dashboard Routes — Guarded by AdminRoute */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<AdminOverviewPage />} />
                <Route path="/admin/students" element={<AdminStudentsPage />} />
                <Route path="/admin/submissions" element={<AdminSubmissionsPage />} />
                <Route path="/admin/problems" element={<AdminProblemsPage />} />
                <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                <Route path="/admin/system" element={<AdminSystemPage />} />
                <Route path="/admin/reports" element={<AdminReportsPage />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        </ArcadeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
