import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Sidebar from './components/Sidebar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import RoomDetailsWrapper from './pages/RoomDetails';
import Profile from './pages/Profile';
import History from './pages/History';
import Leaderboard from './pages/Leaderboard';

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
          <span className="text-slate-400 text-xs font-semibold">Validating session credentials...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Workspace layout for core dashboard panels (shows sidebar on the left)
const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-dark-900 text-slate-100 overflow-hidden h-screen">
      <Sidebar />
      <main className="flex-grow min-w-0 overflow-y-auto flex flex-col h-full bg-dark-900 relative">
        {/* Dynamic ambient grid background */}
        <div className="radial-bg absolute inset-0 pointer-events-none"></div>
        <div className="relative z-10 flex-grow flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Study Room (100% Full-screen workspace canvas, no sidebar) */}
            <Route
              path="/room/:code"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-dark-900 overflow-hidden h-screen flex flex-col">
                    <RoomDetailsWrapper />
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Protected Core Dashboard Pages (Includes Sidebar) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Profile />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <History />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Leaderboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Route fallback redirects to marketing landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
