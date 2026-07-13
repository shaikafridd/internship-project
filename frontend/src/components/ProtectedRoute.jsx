import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="spinner-container" style={{ height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Gating: If user is logged in but hasn't scanned a resume yet, restrict them to /ats-analyzer.
  const hasResume = user?.atsTopMatch?.role;
  if (!hasResume && location.pathname !== '/ats-analyzer') {
    return <Navigate to="/ats-analyzer" replace />;
  }

  return children;
};

export default ProtectedRoute;
