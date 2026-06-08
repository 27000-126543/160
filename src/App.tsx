import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Weather from './pages/Weather';
import Materials from './pages/Materials';
import Emergency from './pages/Emergency';
import Reports from './pages/Reports';
import { useAuthStore, UserRole } from './store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
        
        <Route element={<ProtectedRoute allowedRoles={['operator', 'leader', 'headquarters']}><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/materials" element={<ProtectedRoute allowedRoles={['leader', 'headquarters']}><Materials /></ProtectedRoute>} />
          <Route path="/emergency" element={<ProtectedRoute allowedRoles={['leader', 'headquarters']}><Emergency /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute allowedRoles={['headquarters']}><Reports /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
};

export default App;
