import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import Dashboard from './pages/Dashboard';
import HowToUse from './pages/HowToUse';
import CookieConverter from './pages/CookieConverter';
import OtpTracker from './pages/OtpTracker';
import CookieBot from './pages/CookieBot';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminProtectedRoute({ children }) {
  const { admin } = useAuth();
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminPanel />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/howtouse"
        element={
          <ProtectedRoute>
            <HowToUse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/converter"
        element={
          <ProtectedRoute>
            <CookieConverter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/otp-tracker"
        element={
          <ProtectedRoute>
            <OtpTracker />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cookie-bot"
        element={
          <ProtectedRoute>
            <CookieBot />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
