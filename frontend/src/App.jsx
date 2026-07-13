import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute, { AdminRoute } from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Checkout from './pages/Checkout';
import MyCourses from './pages/MyCourses';
import Jobs from './pages/Jobs';
import ATSAnalyzer from './pages/ATSAnalyzer';
import Profile from './pages/Profile';
import Certificates from './pages/Certificates';
import SavedJobs from './pages/SavedJobs';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Paths that do not show sidebar and navbar (Landing and Auth pages)
  const noLayoutPaths = ['/', '/login', '/signup', '/admin/login'];
  const isAdminPath = location.pathname.startsWith('/admin');
  const showLayout = isAuthenticated && !noLayoutPaths.includes(location.pathname) && !isAdminPath;

  return (
    <div className="app-container">
      {showLayout && <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />}
      
      <div className={showLayout ? 'main-content' : 'full-width-content'}>
        {showLayout && <Navbar toggleSidebar={toggleSidebar} />}
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/dashboard" replace />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
          <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" replace />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Protected Portal Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/courses/:id" element={<ProtectedRoute><CourseDetails /></ProtectedRoute>} />
          <Route path="/checkout/:courseId" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/my-courses/:courseId" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
          <Route path="/ats-analyzer" element={<ProtectedRoute><ATSAnalyzer /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />
          <Route path="/saved-jobs" element={<ProtectedRoute><SavedJobs /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <style>{`
        .full-width-content {
          width: 100%;
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
