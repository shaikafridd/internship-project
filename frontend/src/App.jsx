import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

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
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 1;
      });
    }, 450);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const path = location.pathname;
    const search = location.search;
    let title = 'CareerHub';

    if (path === '/') {
      title = 'CareerHub - Learn, Upskill, Apply, Get Hired';
    } else if (path.startsWith('/admin')) {
      const params = new URLSearchParams(search);
      const tab = params.get('tab');
      title = tab ? `Admin ${tab.charAt(0).toUpperCase() + tab.slice(1)} | CareerHub` : 'Admin Dashboard | CareerHub';
    } else {
      const cleanPath = path.substring(1);
      if (cleanPath) {
        let pageName = cleanPath.split('/')[0];
        pageName = pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-/g, ' ');
        if (pageName === 'Ats analyzer') pageName = 'ATS Optimizer';
        if (pageName === 'Jobs') pageName = 'Applications';
        if (pageName === 'Courses') pageName = 'My Courses';
        title = `${pageName} | CareerHub`;
      }
    }
    document.title = title;
  }, [location]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="wakeup-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: '#0f172a',
        color: 'white',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ maxWidth: '400px', width: '90%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚡</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '10px' }}>Connecting to Server</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '30px', lineHeight: 1.5 }}>
            Waking up the hosting service (Render cold start). This may take up to 45 seconds on the first load...
          </p>
          <div style={{
            height: '6px',
            width: '100%',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '10px'
          }}>
            <div style={{
              height: '100%',
              width: `${percent}%`,
              background: '#2563eb',
              borderRadius: '10px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            <span>{percent}% Waking Up</span>
            <span>Est. ~45s</span>
          </div>
        </div>
      </div>
    );
  }

  // Paths that do not show sidebar and navbar (Landing and Auth pages)
  const noLayoutPaths = ['/', '/login', '/signup', '/admin/login'];
  const showLayout = isAuthenticated && !noLayoutPaths.includes(location.pathname);

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
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
