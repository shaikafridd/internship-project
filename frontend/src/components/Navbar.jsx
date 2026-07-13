import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get Page Title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/jobs')) return 'Jobs Portal';
    if (path.startsWith('/courses')) return 'Learning Center';
    if (path.startsWith('/my-courses')) return 'My Learning';
    if (path.startsWith('/ats-analyzer')) return 'ATS Resume Scanner';
    if (path.startsWith('/profile')) return 'My Profile';
    if (path.startsWith('/checkout')) return 'Invoice Details';
    return 'Welcome';
  };

  return (
    <header className="navbar glass-panel">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="navbar-title">{getPageTitle()}</h1>
      </div>

      <div className="navbar-right">
        {/* Quick Actions / Notifications */}
        <div className="nav-icon-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="dot"></span>
        </div>

        {/* User Card */}
        {user && (
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
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'hsl(var(--primary) / 0.1)',
                  color: 'hsl(var(--primary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  border: '1px solid hsl(var(--border-color))'
                }}
              >
                {user.name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="navbar-username" style={{ marginLeft: !user.photoUrl ? '8px' : '0px' }}>
              {user.name.split(' ')[0]}
            </span>
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
          background: rgba(10, 12, 18, 0.85);
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

        .navbar-title {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #fff, hsl(var(--text-secondary)));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .nav-icon-badge {
          position: relative;
          color: hsl(var(--text-secondary));
          cursor: pointer;
          transition: var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          border: 1px solid hsl(var(--border-color));
        }

        .nav-icon-badge:hover {
          color: hsl(var(--text-primary));
          background-color: hsl(var(--bg-card));
          border-color: hsl(var(--text-muted));
        }

        .nav-icon-badge .dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 7px;
          height: 7px;
          background-color: hsl(var(--accent-red));
          border-radius: 50%;
          border: 1.5px solid hsl(var(--bg-dark));
        }

        .navbar-user-card {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 4px 12px 4px 4px;
          border-radius: 50px;
          border: 1px solid hsl(var(--border-color));
          transition: var(--transition-fast);
        }

        .navbar-user-card:hover {
          background-color: hsl(var(--bg-card));
          border-color: hsl(var(--text-muted));
        }

        .navbar-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          object-fit: cover;
        }

        .navbar-username {
          font-size: 0.85rem;
          font-weight: 600;
          color: hsl(var(--text-primary));
        }

        @media (max-width: 992px) {
          .navbar {
            left: 0;
            padding: 0 20px;
          }

          .menu-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
