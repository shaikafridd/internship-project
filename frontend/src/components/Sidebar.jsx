import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      )
    },
    {
      path: '/courses',
      label: 'My Courses',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    },
    {
      path: '/certificates',
      label: 'Certificates',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    },
    {
      path: '/jobs',
      label: 'Applications',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      )
    },
    {
      path: '/saved-jobs',
      label: 'Saved Jobs',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      )
    },
    {
      path: '/messages',
      label: 'Messages',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      badge: 3
    },
    {
      path: '/payments',
      label: 'Payments',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      )
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    }
  ];

  // Dynamic promo card logic based on current path
  const isCourseView = location.pathname.startsWith('/my-courses');

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
            </svg>
          </div>
          <span>CareerHub</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (window.innerWidth <= 992) toggleSidebar();
              }}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              {item.badge && <span className="sidebar-badge">{item.badge}</span>}
            </NavLink>
          ))}

          {/* Logout Button above promo card */}
          <button className="sidebar-link-btn" onClick={handleLogout}>
            <span className="sidebar-icon logout-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span className="sidebar-label">Logout</span>
          </button>
        </nav>

        {/* Promo card matches template screenshot footer */}
        {isCourseView ? (
          <div className="sidebar-promo-card animate-float">
            <span className="promo-icon">🏆</span>
            <h4>Keep Going!</h4>
            <p>You're doing great. Complete the course and earn your certificate.</p>
            <button className="btn btn-primary" onClick={() => navigate('/profile')}>
              View My Progress
            </button>
          </div>
        ) : (
          <div className="sidebar-promo-card animate-float">
            <span className="promo-icon">👑</span>
            <h4>Go Premium</h4>
            <p>Unlock premium courses, exclusive jobs and more benefits.</p>
            <button className="btn btn-primary" onClick={() => navigate('/payments')}>
              Upgrade Now
            </button>
          </div>
        )}
      </aside>

      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: var(--sidebar-width);
          z-index: 100;
          display: flex;
          flex-direction: column;
          background-color: white;
          border-right: 1px solid hsl(var(--border-color));
          padding: 20px 10px;
          transition: var(--transition-normal);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 16px 20px;
          border-bottom: 1px solid hsl(var(--border-color));
          margin-bottom: 20px;
        }

        .logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background-color: hsl(var(--primary));
          border-radius: 6px;
          color: white;
        }

        .sidebar-brand span {
          font-family: var(--font-title);
          font-weight: 800;
          font-size: 1.25rem;
          color: hsl(var(--text-primary));
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .sidebar-link, .sidebar-link-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          color: hsl(var(--text-secondary));
          text-decoration: none;
          border-radius: var(--radius-sm);
          transition: var(--transition-fast);
          font-weight: 500;
          font-size: 0.9rem;
          position: relative;
        }

        .sidebar-link-btn {
          width: 100%;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }

        .sidebar-link:hover, .sidebar-link-btn:hover {
          color: hsl(var(--text-primary));
          background-color: hsl(var(--bg-dark));
        }

        .sidebar-link.active {
          color: hsl(var(--primary));
          background-color: hsl(var(--primary) / 0.08);
          font-weight: 600;
        }

        .sidebar-icon {
          display: flex;
          align-items: center;
          color: hsl(var(--text-secondary));
        }

        .sidebar-link.active .sidebar-icon {
          color: hsl(var(--primary));
        }

        .logout-icon {
          color: hsl(var(--accent-red) / 0.8);
        }

        .sidebar-badge {
          position: absolute;
          right: 16px;
          background-color: hsl(var(--primary));
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 50px;
        }

        .sidebar-overlay {
          display: none;
        }

        @media (max-width: 992px) {
          .sidebar {
            transform: translateX(-100%);
          }

          .sidebar-open {
            transform: translateX(0);
            box-shadow: 10px 0 30px rgba(0,0,0,0.05);
          }

          .sidebar-overlay {
            display: block;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.3);
            backdrop-filter: blur(2px);
            z-index: 99;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
