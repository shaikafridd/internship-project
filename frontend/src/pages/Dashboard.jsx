import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'User';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardAPI.getDashboardData();
        if (res.success && res.data) {
          setData(res.data);
        } else {
          throw new Error(res.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard', err);
        setError(err.message || 'Unable to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container glass-panel animate-fade-in">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--accent-red))' }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3>Failed to Load Dashboard</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const { stats, continueLearning, upcomingTasks, recentApplications, recommendedCourses } = data || {};

  // Mock static categories matching screenshot (Image 5)
  const categoriesList = [
    { name: 'Development', jobs: '120+ Jobs', icon: '</>', color: 'hsl(var(--primary))', bg: 'hsl(var(--primary) / 0.08)' },
    { name: 'Design', jobs: '85+ Jobs', icon: '🎨', color: 'hsl(var(--secondary))', bg: 'hsl(var(--secondary) / 0.08)' },
    { name: 'Marketing', jobs: '60+ Jobs', icon: '📢', color: 'hsl(var(--accent-yellow))', bg: 'hsl(var(--accent-yellow) / 0.08)' },
    { name: 'Data Science', jobs: '45+ Jobs', icon: '📊', color: 'hsl(var(--accent-green))', bg: 'hsl(var(--accent-green) / 0.08)' },
    { name: 'Cloud Computing', jobs: '30+ Jobs', icon: '☁️', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)' }
  ];

  return (
    <div className="dashboard-wrapper animate-fade-in">
      
      {/* Greeting Banner */}
      <div className="greeting-header">
        <h2>Good Morning, {firstName}! 👋</h2>
        <p>Let's continue your learning journey.</p>
      </div>

      {/* Stats row widgets (5 blocks matching Image 5) */}
      <div className="stats-row">
        <div className="stat-widget glass-panel">
          <div className="stat-left">
            <span className="value">{stats?.enrolledCourses ?? 0}</span>
            <span className="label">Enrolled Courses</span>
            <span className="view-all-link" onClick={() => navigate('/courses')}>View all</span>
          </div>
          <div className="stat-icon icon-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
            </svg>
          </div>
        </div>

        <div className="stat-widget glass-panel">
          <div className="stat-left">
            <span className="value">{stats?.certificates ?? 0}</span>
            <span className="label">Certificates</span>
            <span className="view-all-link" onClick={() => navigate('/profile')}>View all</span>
          </div>
          <div className="stat-icon icon-green">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
          </div>
        </div>

        <div className="stat-widget glass-panel">
          <div className="stat-left">
            <span className="value">{stats?.applications ?? 0}</span>
            <span className="label">Applications</span>
            <span className="view-all-link" onClick={() => navigate('/jobs')}>View all</span>
          </div>
          <div className="stat-icon icon-purple">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
        </div>

        <div className="stat-widget glass-panel">
          <div className="stat-left">
            <span className="value">{stats?.savedJobs ?? 0}</span>
            <span className="label">Saved Jobs</span>
            <span className="view-all-link" onClick={() => navigate('/jobs')}>View all</span>
          </div>
          <div className="stat-icon icon-yellow">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        </div>

        <div className="stat-widget glass-panel">
          <div className="stat-left">
            <span className="value">{stats?.messages ?? 0}</span>
            <span className="label">Messages</span>
            <span className="view-all-link" onClick={() => navigate('/dashboard')}>View all</span>
          </div>
          <div className="stat-icon icon-cyan">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="dashboard-grid">
        
        {/* Left Column */}
        <div className="dashboard-col-left">
          
          {/* Continue Learning Card */}
          <div className="learning-card glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span className="card-sec-title">Continue Learning</span>
              <span className="view-all-link" onClick={() => navigate('/courses')}>View all</span>
            </div>
            
            <div className="learning-card-body">
              <div className="learning-thumbnail-card">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                </svg>
                <span>UI/UX DESIGN</span>
              </div>

              <div className="learning-card-details">
                <h3>{continueLearning?.course?.title || 'UI/UX Design Fundamentals'}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginBottom: '6px' }}>
                  <span>{continueLearning?.progress || 65}% Complete</span>
                  <span>12 Lessons | 4h 30m left</span>
                </div>
                <div className="progress-container" style={{ marginBottom: '16px' }}>
                  <div className="progress-bar" style={{ width: `${continueLearning?.progress || 65}%` }}></div>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate(`/my-courses/${continueLearning?.course?._id || '6618e7bcdeac1234567890ab'}`)}
                >
                  Continue Learning
                </button>
              </div>
            </div>
          </div>

          {/* Recommended for You */}
          <div className="recommended-card-block">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span className="card-sec-title">Recommended for You</span>
              <span className="view-all-link" onClick={() => navigate('/courses')}>View all</span>
            </div>

            <div className="recommended-carousel-grid">
              {(recommendedCourses && recommendedCourses.length > 0 ? recommendedCourses : [
                { _id: '1', title: 'Advanced JavaScript', category: 'Development', rating: '4.7', level: 'Intermediate' },
                { _id: '2', title: 'React for Beginners', category: 'Development', rating: '4.6', level: 'Beginner' },
                { _id: '3', title: 'AWS Cloud Practitioner', category: 'Cloud Computing', rating: '4.8', level: 'Beginner' },
                { _id: '4', title: 'Figma UI Design', category: 'Design', rating: '4.5', level: 'Beginner' }
              ]).map((course) => (
                <div key={course._id} className="rec-course-item glass-panel" onClick={() => navigate(course._id.length > 5 ? `/courses/${course._id}` : '/courses')}>
                  <div className="item-thumbnail">
                    <span>{course.category === 'Development' ? 'JS' : course.category === 'Design' ? 'FIGMA' : 'AWS'}</span>
                  </div>
                  <div className="item-summary">
                    <span className="category-label">{course.category}</span>
                    <h4>{course.title}</h4>
                    <div className="item-ratings-row">
                      <span className="stars">⭐ {course.rating || '4.6'}</span>
                      <span className="level-badge">{course.level || 'Beginner'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="dashboard-col-right">
          
          {/* Upcoming Tasks */}
          <div className="side-card-panel glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3>Upcoming Tasks</h3>
              <span className="view-all-link">View all</span>
            </div>

            <div className="tasks-checklist">
              {(upcomingTasks && upcomingTasks.length > 0 ? upcomingTasks : [
                { _id: '1', title: 'React Assignment', dueString: 'Due in 2 days' },
                { _id: '2', title: 'Python Quiz', dueString: 'Due in 5 days' },
                { _id: '3', title: 'UI/UX Project', dueString: 'Due in 6 days' },
                { _id: '4', title: 'Mock Interview', dueString: 'Tomorrow 10:00 AM' }
              ]).map((task) => (
                <div key={task._id} className="task-row-item">
                  <div className="task-row-marker">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="task-checkbox-svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    </svg>
                  </div>
                  <div className="task-row-text">
                    <p className="title">{task.title}</p>
                    <span className="due-label">{task.dueString}</span>
                  </div>
                  <span className="arrow-details">&gt;</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="side-card-panel glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3>Recent Applications</h3>
              <span className="view-all-link" onClick={() => navigate('/jobs')}>View all</span>
            </div>

            <div className="applications-timeline">
              {(recentApplications && recentApplications.length > 0 ? recentApplications : [
                { _id: '1', title: 'Frontend Developer', company: 'TechNova Solutions', status: 'Under Review' },
                { _id: '2', title: 'UI/UX Designer', company: 'PixelPerfect', status: 'Shortlisted' },
                { _id: '3', title: 'Web Developer', company: 'CodeCraft Labs', status: 'Applied' }
              ]).map((app) => (
                <div key={app._id} className="app-timeline-item">
                  <div className="item-left-details">
                    <div className="timeline-bullet-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      </svg>
                    </div>
                    <div className="app-meta">
                      <p className="title">{app.title}</p>
                      <span className="company">{app.company}</span>
                    </div>
                  </div>
                  <span className={`badge ${
                    app.status === 'Shortlisted' ? 'badge-success' : 
                    app.status === 'Applied' ? 'badge-primary' : 
                    app.status === 'Under Review' ? 'badge-warning' : 
                    'badge-danger'
                  }`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Explore Top Categories (Bottom section) */}
      <div className="categories-explorer-block animate-slide-up" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span className="card-sec-title">Explore Top Categories</span>
          <span className="view-all-link">View all categories</span>
        </div>

        <div className="categories-row-layout">
          {categoriesList.map((cat, idx) => (
            <div key={idx} className="category-explorer-card glass-panel" onClick={() => navigate('/jobs')}>
              <div className="cat-icon-wrapper" style={{ backgroundColor: cat.bg, color: cat.color }}>
                <span className="icon">{cat.icon}</span>
              </div>
              <div className="cat-info">
                <h4>{cat.name}</h4>
                <p>{cat.jobs}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .dashboard-wrapper {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .greeting-header h2 {
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 2px;
          color: hsl(var(--text-primary));
        }

        .greeting-header p {
          color: hsl(var(--text-secondary));
          font-size: 0.95rem;
        }

        /* Stats Row Horizontal */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }

        .stat-widget {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
        }

        .stat-left {
          display: flex;
          flex-direction: column;
        }

        .stat-left .value {
          font-family: var(--font-title);
          font-size: 1.6rem;
          font-weight: 800;
          line-height: 1.1;
          color: hsl(var(--text-primary));
        }

        .stat-left .label {
          font-size: 0.8rem;
          font-weight: 600;
          color: hsl(var(--text-secondary));
          margin: 2px 0 6px;
        }

        .view-all-link {
          font-size: 0.75rem;
          font-weight: 700;
          color: hsl(var(--primary));
          text-decoration: none;
          cursor: pointer;
        }

        .view-all-link:hover {
          text-decoration: underline;
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 8px;
        }

        .icon-blue { background-color: rgba(37, 99, 235, 0.08); color: hsl(var(--primary)); }
        .icon-green { background-color: rgba(16, 185, 129, 0.08); color: hsl(var(--accent-green)); }
        .icon-purple { background-color: rgba(139, 92, 246, 0.08); color: #8b5cf6; }
        .icon-yellow { background-color: rgba(245, 158, 11, 0.08); color: hsl(var(--accent-yellow)); }
        .icon-cyan { background-color: rgba(6, 182, 212, 0.08); color: #06b6d4; }

        /* Grids */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 24px;
        }

        .dashboard-col-left, .dashboard-col-right {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .card-sec-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: hsl(var(--text-primary));
        }

        /* Continue Learning */
        .learning-card {
          padding: 24px;
        }

        .learning-card-body {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 20px;
          align-items: center;
        }

        .learning-thumbnail-card {
          height: 120px;
          background: linear-gradient(135deg, #1e3a8a, #3b82f6);
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          gap: 10px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .learning-card-details h3 {
          font-size: 1.25rem;
          margin-bottom: 12px;
        }

        /* Recommended Courses */
        .recommended-carousel-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .rec-course-item {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          cursor: pointer;
          transition: var(--transition-normal);
        }

        .rec-course-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.04);
        }

        .item-thumbnail {
          height: 100px;
          background-color: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: hsl(var(--text-muted));
          font-family: var(--font-title);
          font-weight: 800;
          font-size: 1rem;
        }

        .item-summary {
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .category-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: hsl(var(--primary));
          text-transform: uppercase;
        }

        .item-summary h4 {
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-ratings-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: hsl(var(--text-secondary));
          font-weight: 500;
        }

        /* Side Card Panels */
        .side-card-panel {
          padding: 24px;
        }

        .side-card-panel h3 {
          font-size: 1.1rem;
        }

        .tasks-checklist, .applications-timeline {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .task-row-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-bottom: 12px;
          border-bottom: 1px solid hsl(var(--border-color) / 0.5);
          position: relative;
        }

        .task-row-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .task-checkbox-svg {
          color: hsl(var(--text-muted));
          cursor: pointer;
        }

        .task-row-text .title {
          font-size: 0.85rem;
          font-weight: 600;
          color: hsl(var(--text-primary));
        }

        .task-row-text .due-label {
          font-size: 0.75rem;
          color: hsl(var(--accent-red));
          font-weight: 500;
        }

        .arrow-details {
          margin-left: auto;
          color: hsl(var(--text-muted));
          font-family: monospace;
          font-size: 0.9rem;
          cursor: pointer;
        }

        /* Timeline app items */
        .app-timeline-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background-color: #f8fafc;
          border-radius: var(--radius-sm);
        }

        .item-left-details {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .timeline-bullet-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: white;
          color: hsl(var(--text-muted));
          border: 1px solid hsl(var(--border-color));
        }

        .app-meta .title {
          font-size: 0.85rem;
          font-weight: 600;
        }

        .app-meta .company {
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
        }

        /* Categories row bottom */
        .categories-row-layout {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }

        .category-explorer-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          cursor: pointer;
          transition: var(--transition-normal);
        }

        .category-explorer-card:hover {
          border-color: hsl(var(--primary));
          background-color: hsl(var(--bg-dark));
        }

        .cat-icon-wrapper {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.95rem;
        }

        .cat-info h4 {
          font-size: 0.85rem;
          margin-bottom: 2px;
        }

        .cat-info p {
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
        }

        @media (max-width: 992px) {
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .categories-row-layout {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
