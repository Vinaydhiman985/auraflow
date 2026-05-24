import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HabitProvider } from './context/HabitContext';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Tasks from './pages/Tasks'; // Added Task Planner!
import Analytics from './pages/Analytics';
import Pomodoro from './pages/Pomodoro';
import Profile from './pages/Profile';
import Report from './pages/Report';

// Authenticated Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HabitProvider>
          <Router>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Workspace Layout */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="habits" element={<Habits />} />
                        <Route path="tasks" element={<Tasks />} /> {/* Added Task Planner! */}
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="pomodoro" element={<Pomodoro />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="report" element={<Report />} />
                        {/* Default route redirect to /dashboard */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster 
              position="top-right" 
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontFamily: 'Inter, sans-serif'
                },
                success: {
                  iconTheme: {
                    primary: '#6366f1',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
          </Router>
        </HabitProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
