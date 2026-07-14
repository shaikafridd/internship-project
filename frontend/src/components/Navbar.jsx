import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isCourseView = location.pathname.startsWith('/my-courses');
  const isProfileView = location.pathname.startsWith('/profile');

  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('search') || '');
  }, [location.search]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    // Auto-update URL in real-time if we are on courses or jobs pages
    const isCourses = location.pathname.startsWith('/courses');
    const isJobs = location.pathname.startsWith('/jobs');
    if (isCourses || isJobs) {
      const targetPage = isJobs ? '/jobs' : '/courses';
      if (val) {
        navigate(`${targetPage}?search=${encodeURIComponent(val)}`, { replace: true });
      } else {
        navigate(targetPage, { replace: true });
      }
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      const isJobs = location.pathname.startsWith('/jobs');
      const targetPage = isJobs ? '/jobs' : '/courses';
      navigate(`${targetPage}?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getPageTitle = () => {
    if (isCourseView) {
      return (
        <div className="navbar-breadcrumb">
          <span className="back-link" onClick={() => navigate('/courses')}>&larr; My Courses</span>
          <span className="sep">&gt;</span>
          <span className="current">UI/UX Design Fundamentals</span>
        </div>
      );
    }
    if (isProfileView) {
      return (
        <div className="navbar-breadcrumb">
          <span className="back-link" onClick={() => navigate('/dashboard')}>&larr; Dashboard</span>
          <span className="sep">&gt;</span>
          <span className="current">My Profile</span>
        </div>
      );
    }

    const path = location.pathname;
    const search = location.search;

    if (path.startsWith('/admin')) {
      const params = new URLSearchParams(search);
      const tab = params.get('tab');
      if (tab) {
        return `Admin ${tab.charAt(0).toUpperCase() + tab.slice(1)}`;
      }
      return 'Admin Dashboard';
    }

    switch (path) {
      case '/dashboard':
        return 'Dashboard';
      case '/courses':
        return 'My Courses';
      case '/certificates':
        return 'Certificates';
      case '/jobs':
        return 'Applications';
      case '/saved-jobs':
        return 'Saved Jobs';
      case '/ats-analyzer':
        return 'ATS Optimizer';
      case '/messages':
        return 'Messages';
      case '/payments':
        return 'Payments';
      case '/profile':
        return 'Profile';
      case '/settings':
        return 'Settings';
      default:
        return '';
    }
  };

  const pageTitle = getPageTitle();
 
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div 
          onClick={() => navigate('/')} 
          style={{ cursor: 'pointer' }}
          className="navbar-logo-mobile"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--primary))' }}>
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
          </svg>
          <span style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1.15rem', color: 'hsl(var(--text-primary))' }}>CareerHub</span>
        </div>
        
        {pageTitle && (
          typeof pageTitle === 'object' ? (
            pageTitle
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img 
                src="/logo.jpg" 
                alt="Logo" 
                style={{ 
                  height: '28px', 
                  width: '28px', 
                  objectFit: 'cover', 
                  borderRadius: '6px',
                  border: '1px solid hsl(var(--border-color))'
                }} 
              />
              <h2 className="navbar-page-title">{pageTitle}</h2>
            </div>
          )
        )}
      </div>

      {user?.role !== 'admin' && (
        <div className="navbar-center-search">
          <div className="navbar-search-container">
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search for courses, jobs..." 
              className="navbar-search-input"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        </div>
      )}

      <div className="navbar-right">
        {user?.role !== 'admin' && (
          <>
            {/* Mail Icon (visible on profile or generally) */}
            <div className="nav-icon-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>

            {/* Notification Bell Icon */}
            <div className="nav-icon-btn has-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="badge-count">3</span>
            </div>
          </>
        )}

        {/* User Card */}
        {user && user.role !== 'admin' && (
          <div className="navbar-user-card" onClick={() => navigate('/profile')}>
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.name}
                className="navbar-avatar"
              />
            ) : (
              <div 
                className="navbar-avatar-initials"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'hsl(var(--primary) / 0.1)',
                  color: 'hsl(var(--primary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  border: '1px solid hsl(var(--border-color))'
                }}
              >
                {(user.name || 'Arshad Khan').split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="navbar-user-info">
              <span className="navbar-username">{user.name || 'Arshad Khan'}</span>
              {!isCourseView && <span className="navbar-user-role">{user.role || 'Web Developer'}</span>}
            </div>
            <svg className="chevron-down" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        )}

        {user && user.role === 'admin' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'hsl(var(--text-primary))', fontWeight: 600, fontSize: '0.9rem', marginRight: '16px' }}>
            <span>👤 Welcome, Admin</span>
          </div>
        )}
      </div>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          right: 0;
          left: var(--sidebar-width);
          height: var(--navbar-height);
          z-index: 90;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 30px;
          border-radius: 0;
          border: none;
          border-bottom: 1px solid hsl(var(--border-color));
          background: #ffffff;
          transition: var(--transition-normal);
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .menu-toggle {
          display: none;
          background: transparent;
          border: none;
          color: hsl(var(--text-primary));
          cursor: pointer;
          padding: 4px;
        }

        /* Breadcrumbs styling to match Image 1 */
        .navbar-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          color: hsl(var(--text-secondary));
        }

        .navbar-breadcrumb .back-link {
          cursor: pointer;
          font-weight: 600;
          transition: color var(--transition-fast);
        }

        .navbar-breadcrumb .back-link:hover {
          color: hsl(var(--primary));
        }

        .navbar-breadcrumb .sep {
          color: hsl(var(--text-muted));
        }

        .navbar-breadcrumb .current {
          color: hsl(var(--text-primary));
          font-weight: 600;
        }

        .navbar-page-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: hsl(var(--text-primary));
        }

        /* Search styling to match Image 1, 2, 3 */
        .navbar-center-search {
          flex: 1;
          display: flex;
          justify-content: flex-end;
          max-width: 480px;
          margin-left: 24px;
          margin-right: 24px;
        }

        .navbar-search-container {
          position: relative;
          width: 100%;
          max-width: 320px;
        }

        .navbar-search-container .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: hsl(var(--text-muted));
          pointer-events: none;
        }

        .navbar-search-input {
          width: 100%;
          background-color: #f8fafc;
          border: 1px solid hsl(var(--border-color));
          border-radius: 50px;
          padding: 9px 16px 9px 40px;
          font-size: 0.85rem;
          color: hsl(var(--text-primary));
          outline: none;
          transition: all var(--transition-fast);
        }

        .navbar-search-input:focus {
          border-color: hsl(var(--primary));
          background-color: #ffffff;
          box-shadow: 0 0 0 3px var(--primary-glow);
        }

        /* Right items */
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .nav-icon-btn {
          position: relative;
          color: hsl(var(--text-secondary));
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid hsl(var(--border-color));
          background-color: #ffffff;
          transition: all var(--transition-fast);
        }

        .nav-icon-btn:hover {
          color: hsl(var(--text-primary));
          background-color: hsl(var(--bg-dark));
          border-color: hsl(var(--text-muted));
        }

        .nav-icon-btn.has-badge .badge-count {
          position: absolute;
          top: -2px;
          right: -2px;
          background-color: hsl(var(--accent-red));
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
        }

        /* User Info styling */
        .navbar-user-card {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 4px;
          border-radius: 50px;
          border: 1px solid transparent;
          transition: var(--transition-fast);
        }

        .navbar-user-card:hover {
          background-color: hsl(var(--bg-dark));
        }

        .navbar-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid hsl(var(--border-color));
        }

        .navbar-user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .navbar-username {
          font-size: 0.85rem;
          font-weight: 700;
          color: hsl(var(--text-primary));
          line-height: 1.2;
        }

        .navbar-user-role {
          font-size: 0.7rem;
          font-weight: 500;
          color: hsl(var(--text-secondary));
          line-height: 1;
          margin-top: 1px;
        }

        .chevron-down {
          color: hsl(var(--text-muted));
          transition: color var(--transition-fast);
        }

        .navbar-user-card:hover .chevron-down {
          color: hsl(var(--text-primary));
        }

        .navbar-logo-mobile {
          display: none;
        }

        @media (max-width: 992px) {
          .navbar-logo-mobile {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .navbar {
            left: 0;
            padding: 0 20px;
          }

          .menu-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .navbar-center-search {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
