import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // State Management for Courses (Persistent in LocalStorage)
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('admin_courses');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'UI/UX Design Mastercourse', instructor: 'Arshad Khan', students: '2,845', price: '₹4,999', status: 'Published' },
      { id: 2, name: 'Full Stack Web Development', instructor: 'Priya Sharma', students: '2,450', price: '₹6,999', status: 'Published' },
      { id: 3, name: 'Python for Data Science', instructor: 'Raj Malhotra', students: '2,120', price: '₹5,999', status: 'Published' },
      { id: 4, name: 'React Developer Bootcamp', instructor: 'Neha Verma', students: '1,890', price: '₹4,499', status: 'Published' },
      { id: 5, name: 'Digital Marketing Mastery', instructor: 'Sandeep Das', students: '1,560', price: '₹3,999', status: 'Published' }
    ];
  });

  // State Management for Payments (Persistent in LocalStorage)
  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem('admin_payments');
    return saved ? JSON.parse(saved) : [
      { id: 1, student: 'Riya Sharma', course: 'UI/UX Design', amount: '₹4,999', status: 'Paid', date: 'Jul 12, 2025' },
      { id: 2, student: 'Mohammed Ali', course: 'Full Stack Web Dev', amount: '₹6,999', status: 'Paid', date: 'Jul 12, 2025' },
      { id: 3, student: 'Anjali Verma', course: 'Python for Data Sci', amount: '₹3,999', status: 'Paid', date: 'Jul 12, 2025' },
      { id: 4, student: 'Rohan Mehta', course: 'React Bootcamp', amount: '₹4,999', status: 'Pending', date: 'Jul 12, 2025' },
      { id: 5, student: 'Sneha Patel', course: 'Digital Marketing', amount: '₹2,999', status: 'Paid', date: 'Jul 11, 2025' }
    ];
  });

  // Persist States
  useEffect(() => {
    localStorage.setItem('admin_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('admin_payments', JSON.stringify(payments));
  }, [payments]);

  // Modals / Editing States
  const [editCourseId, setEditCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState({ name: '', instructor: '', price: '', status: '' });
  const [editPaymentId, setEditPaymentId] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ student: '', course: '', amount: '', status: '' });

  // Course Actions
  const handleEditCourse = (course) => {
    setEditCourseId(course.id);
    setCourseForm({ name: course.name, instructor: course.instructor, price: course.price, status: course.status });
  };

  const handleSaveCourse = (e) => {
    e.preventDefault();
    setCourses(courses.map(c => c.id === editCourseId ? { ...c, ...courseForm } : c));
    setEditCourseId(null);
  };

  const handleDeleteCourse = (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const toggleCourseStatus = (id) => {
    setCourses(courses.map(c => c.id === id ? { ...c, status: c.status === 'Published' ? 'Draft' : 'Published' } : c));
  };

  // Payment Actions
  const handleEditPayment = (payment) => {
    setEditPaymentId(payment.id);
    setPaymentForm({ student: payment.student, course: payment.course, amount: payment.amount, status: payment.status });
  };

  const handleSavePayment = (e) => {
    e.preventDefault();
    setPayments(payments.map(p => p.id === editPaymentId ? { ...p, ...paymentForm } : p));
    setEditPaymentId(null);
  };

  const handleDeletePayment = (id) => {
    if (window.confirm("Are you sure you want to delete this payment record?")) {
      setPayments(payments.filter(p => p.id !== id));
    }
  };

  const togglePaymentStatus = (id) => {
    setPayments(payments.map(p => p.id === id ? { ...p, status: p.status === 'Paid' ? 'Pending' : 'Paid' } : p));
  };

  // Static stats derived from state totals
  const totalRevenueNumber = payments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + parseInt(p.amount.replace(/[^0-9]/g, ''), 10), 0);

  const formatCurrency = (num) => {
    return '₹' + num.toLocaleString('en-IN');
  };

  const menuItems = [
    { label: 'Dashboard', icon: '📊', active: true },
    { category: 'MANAGE' },
    { label: 'Users', icon: '👥' },
    { label: 'Courses', icon: '📖' },
    { label: 'Enrollments', icon: '🎓' },
    { label: 'Certificates', icon: '🎖️' },
    { label: 'Applications', icon: '📄' },
    { label: 'Jobs', icon: '💼' },
    { category: 'FINANCE' },
    { label: 'Payments', icon: '💳' },
    { label: 'Transactions', icon: '🔄' },
    { label: 'Refunds', icon: '↩️' },
    { label: 'Discounts', icon: '🏷️' },
    { category: 'COMMUNICATION' },
    { label: 'Messages', icon: '💬' },
    { label: 'Notifications', icon: '🔔' },
    { category: 'SETTINGS' },
    { label: 'Site Settings', icon: '⚙️' },
    { label: 'Roles & Permissions', icon: '🛡️' },
    { label: 'System Logs', icon: '📄' }
  ];

  return (
    <div className="admin-container animate-fade-in">
      
      {/* 1. Admin Left Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="logo-icon-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
            </svg>
          </div>
          <div className="brand-text">
            <h3>CareerHub</h3>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="admin-nav-links">
          {menuItems.map((item, idx) => {
            if (item.category) {
              return <span key={idx} className="nav-section-title">{item.category}</span>;
            }
            return (
              <button 
                key={idx} 
                className={`admin-nav-link ${item.active ? 'active' : ''}`}
                type="button"
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}

          <div style={{ padding: '0 10px', marginTop: '20px' }}>
            <button className="admin-nav-link logout-btn" onClick={handleLogout} type="button">
              <span className="nav-icon">🚪</span>
              <span className="nav-label">Logout</span>
            </button>
          </div>
        </nav>

        {/* Profile Card Footer */}
        <div className="admin-profile-footer">
          <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100" alt="Admin" className="admin-avatar" />
          <div className="admin-info">
            <h4>{user?.name || 'Admin'}</h4>
            <span>Super Administrator</span>
          </div>
          <span className="down-chevron">▾</span>
        </div>
      </aside>

      {/* 2. Admin Main Panel */}
      <main className="admin-main-panel">
        
        {/* Top Header Row */}
        <header className="admin-header">
          <div className="admin-header-left">
            <h2>Welcome back, Admin! 👋</h2>
            <p>Here's what's happening on your platform today.</p>
          </div>

          <div className="admin-header-right">
            {/* Date Picker Widget */}
            <div className="date-picker-widget">
              <span>📅 Jul 06, 2025 - Jul 12, 2025</span>
            </div>

            {/* Search container */}
            <div className="admin-search-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="search-icon">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" placeholder="Search anything..." />
            </div>

            {/* Notification Bell */}
            <div className="admin-notify-btn">
              🔔
              <span className="badge">5</span>
            </div>

            {/* Admin Avatar */}
            <div className="admin-avatar-card">
              <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80" alt="Admin" />
              <span>Admin ▾</span>
            </div>
          </div>
        </header>

        {/* Grid Container Content */}
        <div className="admin-content-grid">
          
          {/* ROW 1: 5 STAT CARDS */}
          <div className="admin-stats-row">
            <div className="admin-stat-card glass-panel">
              <div className="stat-icon icon-blue">👥</div>
              <div className="stat-desc">
                <span>Total Students</span>
                <h3>12,845</h3>
                <span className="trend-green">↑ 12.5% <span className="trend-lbl">vs last week</span></span>
              </div>
            </div>

            <div className="admin-stat-card glass-panel">
              <div className="stat-icon icon-green">📖</div>
              <div className="stat-desc">
                <span>Active Courses</span>
                <h3>{courses.length}</h3>
                <span className="trend-green">↑ 8.3% <span className="trend-lbl">vs last week</span></span>
              </div>
            </div>

            <div className="admin-stat-card glass-panel">
              <div className="stat-icon icon-purple">🎓</div>
              <div className="stat-desc">
                <span>Total Enrollments</span>
                <h3>25,671</h3>
                <span className="trend-green">↑ 15.7% <span className="trend-lbl">vs last week</span></span>
              </div>
            </div>

            <div className="admin-stat-card glass-panel">
              <div className="stat-icon icon-orange">💰</div>
              <div className="stat-desc">
                <span>Total Revenue</span>
                <h3>{formatCurrency(1860000 + totalRevenueNumber)}</h3>
                <span className="trend-green">↑ 18.6% <span className="trend-lbl">vs last week</span></span>
              </div>
            </div>

            <div className="admin-stat-card glass-panel">
              <div className="stat-icon icon-red">💳</div>
              <div className="stat-desc">
                <span>Pending Payouts</span>
                <h3>₹2,45,300</h3>
                <span className="trend-red">↓ 3.2% <span className="trend-lbl">vs last week</span></span>
              </div>
            </div>
          </div>

          {/* ROW 2: REVENUE & DONUT */}
          <div className="admin-charts-row">
            
            {/* Revenue Line Chart Card */}
            <div className="chart-card-wrapper glass-panel col-span-2">
              <div className="chart-header">
                <h3>Revenue Overview</h3>
                <select className="date-select-dropdown">
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
              </div>
              <div className="revenue-large-summary">
                <h2>{formatCurrency(1860000 + totalRevenueNumber)}</h2>
                <span className="trend-green">↑ 18.6% vs last week</span>
              </div>

              {/* Vector SVG Line Chart representation */}
              <div className="line-chart-svg-container">
                <svg className="line-chart-svg" viewBox="0 0 500 200">
                  <defs>
                    <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15"/>
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="30" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="30" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="30" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="30" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="30" y1="170" x2="480" y2="170" stroke="#e2e8f0" strokeWidth="1.5" />
                  
                  {/* Chart Fill area */}
                  <path d="M 30 140 Q 90 90 150 110 T 270 120 T 390 60 T 480 100 L 480 170 L 30 170 Z" fill="url(#chart-glow)"/>
                  
                  {/* Chart Line path */}
                  <path d="M 30 140 Q 90 90 150 110 T 270 120 T 390 60 T 480 100" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
                  
                  {/* Coordinates Markers / Circles */}
                  <circle cx="30" cy="140" r="4" fill="white" stroke="hsl(var(--primary))" strokeWidth="2"/>
                  <circle cx="110" cy="100" r="4" fill="white" stroke="hsl(var(--primary))" strokeWidth="2"/>
                  <circle cx="190" cy="115" r="4" fill="white" stroke="hsl(var(--primary))" strokeWidth="2"/>
                  <circle cx="270" cy="120" r="4" fill="white" stroke="hsl(var(--primary))" strokeWidth="2"/>
                  <circle cx="350" cy="90" r="4" fill="white" stroke="hsl(var(--primary))" strokeWidth="2"/>
                  <circle cx="430" cy="65" r="5" fill="hsl(var(--primary))" stroke="white" strokeWidth="2"/>
                  <circle cx="480" cy="100" r="4" fill="white" stroke="hsl(var(--primary))" strokeWidth="2"/>

                  {/* Date labels */}
                  <text x="30" y="190" fontSize="10" fill="#94a3b8" textAnchor="middle">Jul 06</text>
                  <text x="110" y="190" fontSize="10" fill="#94a3b8" textAnchor="middle">Jul 07</text>
                  <text x="190" y="190" fontSize="10" fill="#94a3b8" textAnchor="middle">Jul 08</text>
                  <text x="270" y="190" fontSize="10" fill="#94a3b8" textAnchor="middle">Jul 09</text>
                  <text x="350" y="190" fontSize="10" fill="#94a3b8" textAnchor="middle">Jul 10</text>
                  <text x="430" y="190" fontSize="10" fill="#2563eb" fontWeight="bold" textAnchor="middle">Jul 11</text>
                  <text x="480" y="190" fontSize="10" fill="#94a3b8" textAnchor="middle">Jul 12</text>
                </svg>
              </div>
            </div>

            {/* Students by Course Donut Chart Card */}
            <div className="chart-card-wrapper glass-panel">
              <div className="chart-header">
                <h3>Students by Course</h3>
              </div>
              <div className="donut-chart-box">
                {/* SVG Donut */}
                <div className="donut-svg-wrapper">
                  <svg width="120" height="120" viewBox="0 0 42 42" className="donut-svg">
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#e2e8f0" strokeWidth="4.5"></circle>
                    
                    {/* UI/UX (22%) */}
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#2563eb" strokeWidth="4.5" strokeDasharray="22 78" strokeDashoffset="25"></circle>
                    {/* Full Stack (19%) */}
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#10b981" strokeWidth="4.5" strokeDasharray="19 81" strokeDashoffset="3"></circle>
                    {/* Python (16%) */}
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f59e0b" strokeWidth="4.5" strokeDasharray="16 84" strokeDashoffset="84"></circle>
                    {/* React (15%) */}
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#8b5cf6" strokeWidth="4.5" strokeDasharray="15 85" strokeDashoffset="68"></circle>
                    {/* Digital Marketing (12%) */}
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#06b6d4" strokeWidth="4.5" strokeDasharray="12 88" strokeDashoffset="53"></circle>
                  </svg>
                  <div className="donut-inner-text">
                    <strong>12,845</strong>
                    <span>Total Students</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="donut-legend-list">
                  <div className="legend-item"><span className="dot dot-blue"></span> <span>UI/UX Design: 2,845 (22%)</span></div>
                  <div className="legend-item"><span className="dot dot-green"></span> <span>Full Stack Web: 2,450 (19%)</span></div>
                  <div className="legend-item"><span className="dot dot-yellow"></span> <span>Python for Data: 2,120 (16%)</span></div>
                  <div className="legend-item"><span className="dot dot-purple"></span> <span>React Bootc: 1,890 (15%)</span></div>
                  <div className="legend-item"><span className="dot dot-cyan"></span> <span>Digital Mark: 1,560 (12%)</span></div>
                </div>
              </div>
            </div>

          </div>

          {/* ROW 3: INTERACTIVE PAYMENTS */}
          <div className="admin-tables-row-grid">
            
            {/* Left column: Payments Overview */}
            <div className="admin-card-panel glass-panel col-span-2">
              <div className="panel-header-row">
                <h3>Payments Overview (Interactive)</h3>
              </div>

              {/* Payments overview sub-blocks */}
              <div className="payments-mini-stats-grid">
                <div className="payments-stat-sub-card">
                  <span>Total Payments</span>
                  <h4>{formatCurrency(1860000 + totalRevenueNumber)}</h4>
                </div>
                <div className="payments-stat-sub-card border-green">
                  <span>Successful Payments</span>
                  <h4 style={{ color: '#10b981' }}>{formatCurrency(1630000 + totalRevenueNumber)}</h4>
                </div>
                <div className="payments-stat-sub-card border-yellow">
                  <span>Refunds</span>
                  <h4 style={{ color: '#f59e0b' }}>₹1,20,300</h4>
                </div>
                <div className="payments-stat-sub-card border-red">
                  <span>Pending Payouts</span>
                  <h4 style={{ color: '#ef4444' }}>₹2,45,300</h4>
                </div>
              </div>

              <span className="section-subtitle-lbl">Recent Payments</span>
              
              {editPaymentId && (
                <form onSubmit={handleSavePayment} className="admin-inline-form glass-panel animate-fade-in" style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 12px' }}>Edit Payment Record</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                    <input type="text" placeholder="Student Name" value={paymentForm.student} onChange={e => setPaymentForm({...paymentForm, student: e.target.value})} style={{ padding: '6px', fontSize: '0.8rem' }} required />
                    <input type="text" placeholder="Course" value={paymentForm.course} onChange={e => setPaymentForm({...paymentForm, course: e.target.value})} style={{ padding: '6px', fontSize: '0.8rem' }} required />
                    <input type="text" placeholder="Amount" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} style={{ padding: '6px', fontSize: '0.8rem' }} required />
                    <select value={paymentForm.status} onChange={e => setPaymentForm({...paymentForm, status: e.target.value})} style={{ padding: '6px', fontSize: '0.8rem' }}>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>Save Changes</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setEditPaymentId(null)} style={{ padding: '4px 12px', fontSize: '0.75rem' }}>Cancel</button>
                  </div>
                </form>
              )}

              <table className="admin-data-table font-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700 }}>{p.student}</td>
                      <td>{p.course}</td>
                      <td style={{ fontWeight: 600 }}>{p.amount}</td>
                      <td>
                        <span 
                          onClick={() => togglePaymentStatus(p.id)}
                          className={`badge ${p.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}
                          style={{ cursor: 'pointer' }}
                          title="Click to toggle status"
                        >
                          {p.status}
                        </span>
                      </td>
                      <td>{p.date}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="icon-action-btn" onClick={() => handleEditPayment(p)} title="Edit">✏️</button>
                          <button className="icon-action-btn" onClick={() => togglePaymentStatus(p.id)} title="Toggle Status">⚙️</button>
                          <button className="icon-action-btn" onClick={() => handleDeletePayment(p.id)} title="Delete" style={{ color: '#ef4444' }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Middle: Active Students Progress list */}
            <div className="admin-card-panel glass-panel">
              <div className="panel-header-row">
                <h3>Active Students</h3>
              </div>

              <div className="active-students-list">
                {[
                  { name: 'UI/UX Design Mastercourse', students: '2,845', percent: '22%' },
                  { name: 'Full Stack Web Development', students: '2,450', percent: '19%' },
                  { name: 'Python for Data Science', students: '2,120', percent: '16%' },
                  { name: 'React Developer Bootcamp', students: '1,890', percent: '15%' },
                  { name: 'Digital Marketing Mastery', students: '1,560', percent: '12%' },
                  { name: 'Others', students: '1,980', percent: '16%' }
                ].map((item, idx) => (
                  <div key={idx} className="active-student-progress-row">
                    <div className="progress-labels">
                      <span className="course-name">{item.name}</span>
                      <span className="student-count">{item.students}</span>
                    </div>
                    <div className="progress-container-bar">
                      <div className="progress-fill-bar" style={{ width: item.percent }}></div>
                      <span className="percent-label">{item.percent}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ROW 4: ENROLLMENTS, SYSTEM VIDEOS & UPLOADS */}
          <div className="admin-tables-row-grid">

            {/* Left: Recent Enrollments */}
            <div className="admin-card-panel glass-panel">
              <div className="panel-header-row">
                <h3>Recent Enrollments</h3>
              </div>

              <div className="recent-enrollments-list">
                {[
                  { name: 'Riya Sharma', course: 'UI/UX Design Mastercourse', time: '2 min ago', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
                  { name: 'Mohammed Ali', course: 'Full Stack Web Development', time: '10 min ago', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
                  { name: 'Anjali Verma', course: 'Python for Data Science', time: '15 min ago', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
                  { name: 'Rohan Mehta', course: 'React Developer Bootcamp', time: '20 min ago', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
                  { name: 'Sneha Patel', course: 'Digital Marketing Mastery', time: '25 min ago', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' }
                ].map((item, idx) => (
                  <div key={idx} className="enrollment-list-item">
                    <img src={item.img} alt={item.name} className="user-avatar-circle" />
                    <div className="user-details">
                      <strong>{item.name}</strong>
                      <span>{item.course}</span>
                    </div>
                    <span className="time-lbl">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle: Upload Course Videos */}
            <div className="admin-card-panel glass-panel">
              <div className="panel-header-row">
                <h3>Upload Course Videos</h3>
              </div>

              <div className="upload-dropzone-box">
                <span className="upload-icon">☁️</span>
                <strong>Drag & drop your video file here</strong>
                <span>or <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', marginTop: '8px' }}>Choose File</button></span>
                <span className="upload-limits-lbl" style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '8px' }}>Supports: MP4, WebM, MOV | Max size: 2GB</span>
              </div>

              <span className="section-subtitle-lbl" style={{ marginTop: '14px' }}>Recent Uploads</span>
              <div className="recent-uploads-list">
                {[
                  { name: 'Introduction to UI/UX Design.mp4', date: '12 Jul, 2025', size: '245 MB' },
                  { name: 'Flexbox in CSS - Complete Guide.mp4', date: '11 Jul, 2025', size: '180 MB' },
                  { name: 'Python Variables and Data Types.mp4', date: '11 Jul, 2025', size: '320 MB' }
                ].map((item, idx) => (
                  <div key={idx} className="upload-file-item">
                    <span className="file-icon">📹</span>
                    <div className="file-meta">
                      <strong>{item.name}</strong>
                      <span>{item.date}</span>
                    </div>
                    <span className="file-size-lbl">{item.size}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: System Overview */}
            <div className="admin-card-panel glass-panel">
              <div className="panel-header-row">
                <h3>System Overview</h3>
              </div>

              <div className="system-overview-stats-grid">
                <div className="sys-stat-item">
                  <span>Total Users</span>
                  <strong>15,642</strong>
                </div>
                <div className="sys-stat-item">
                  <span>Instructors</span>
                  <strong>128</strong>
                </div>
                <div className="sys-stat-item">
                  <span>Jobs Posted</span>
                  <strong>512</strong>
                </div>
                <div className="sys-stat-item">
                  <span>Certificates Issued</span>
                  <strong>8,921</strong>
                </div>
              </div>

              {/* Storage Usage bar */}
              <div className="sys-storage-usage-block" style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
                  <span>Storage Usage</span>
                  <span>45.6 GB / 200 GB (22%)</span>
                </div>
                <div className="progress-container-bar" style={{ height: '8px' }}>
                  <div className="progress-fill-bar" style={{ width: '22%', backgroundColor: '#2563eb' }}></div>
                </div>
              </div>

              {/* Server Status */}
              <div className="sys-server-status-block" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Server Status</span>
                <span className="status-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>
                  <span className="status-dot-pulse"></span> All Systems Operational
                </span>
              </div>
            </div>

          </div>

          {/* ROW 5: ALL COURSES TABLE (INTERACTIVE) */}
          <div className="admin-card-panel glass-panel" style={{ gridColumn: '1 / -1' }}>
            <div className="panel-header-row">
              <h3>All Courses (Interactive)</h3>
            </div>

            {editCourseId && (
              <form onSubmit={handleSaveCourse} className="admin-inline-form glass-panel animate-fade-in" style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 12px' }}>Edit Course Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  <input type="text" placeholder="Course Name" value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} style={{ padding: '6px', fontSize: '0.8rem' }} required />
                  <input type="text" placeholder="Instructor" value={courseForm.instructor} onChange={e => setCourseForm({...courseForm, instructor: e.target.value})} style={{ padding: '6px', fontSize: '0.8rem' }} required />
                  <input type="text" placeholder="Price" value={courseForm.price} onChange={e => setCourseForm({...courseForm, price: e.target.value})} style={{ padding: '6px', fontSize: '0.8rem' }} required />
                  <select value={courseForm.status} onChange={e => setCourseForm({...courseForm, status: e.target.value})} style={{ padding: '6px', fontSize: '0.8rem' }}>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>Save Course</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditCourseId(null)} style={{ padding: '4px 12px', fontSize: '0.75rem' }}>Cancel</button>
                </div>
              </form>
            )}

            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Instructor</th>
                  <th>Students</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700 }}>{c.name}</td>
                    <td>{c.instructor}</td>
                    <td>{c.students}</td>
                    <td style={{ fontWeight: 600 }}>{c.price}</td>
                    <td>
                      <span 
                        onClick={() => toggleCourseStatus(c.id)}
                        className={`badge ${c.status === 'Published' ? 'badge-success' : 'badge-secondary'}`}
                        style={{ cursor: 'pointer' }}
                        title="Click to toggle status"
                      >
                        {c.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="actions-icons-row" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button className="icon-action-btn" onClick={() => handleEditCourse(c)} title="Edit">✏️</button>
                        <button className="icon-action-btn" onClick={() => toggleCourseStatus(c.id)} title="Toggle Status">⚙️</button>
                        <button className="icon-action-btn" onClick={() => handleDeleteCourse(c.id)} title="Delete" style={{ color: '#ef4444' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </main>

      {/* Styled JSX Rules */}
      <style>{`
        .admin-container {
          display: flex;
          min-height: 100vh;
          background-color: #f8fafc;
        }

        /* Sidebar styling */
        .admin-sidebar {
          width: 260px;
          background-color: #0b0d19;
          color: rgba(255,255,255,0.7);
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(255,255,255,0.05);
          position: fixed;
          top: 0; bottom: 0; left: 0;
          z-index: 10;
        }

        .admin-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .logo-icon-blue {
          width: 32px;
          height: 32px;
          background-color: #2563eb;
          border-radius: 6px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-text h3 {
          color: white;
          font-size: 1.15rem;
          font-weight: 800;
          line-height: 1.1;
        }

        .brand-text span {
          font-size: 0.75rem;
          color: #3b82f6;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .admin-nav-links {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 16px 12px;
          overflow-y: auto;
          gap: 4px;
        }

        .nav-section-title {
          font-size: 0.7rem;
          font-weight: 800;
          color: rgba(255,255,255,0.3);
          padding: 14px 16px 6px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 16px;
          width: 100%;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.7);
          text-align: left;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .admin-nav-link:hover {
          color: white;
          background-color: rgba(255,255,255,0.03);
        }

        .admin-nav-link.active {
          color: white;
          background-color: #2563eb;
        }

        .logout-btn {
          color: #f87171;
        }

        .logout-btn:hover {
          background-color: rgba(239, 68, 68, 0.1);
        }

        .admin-profile-footer {
          padding: 16px 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          gap: 12px;
          background-color: rgba(0,0,0,0.15);
        }

        .admin-profile-footer .admin-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid rgba(255,255,255,0.1);
        }

        .admin-profile-footer .admin-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .admin-profile-footer .admin-info h4 {
          font-size: 0.8rem;
          font-weight: 700;
          color: white;
          line-height: 1.2;
        }

        .admin-profile-footer .admin-info span {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.4);
        }

        .down-chevron {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.3);
        }

        /* Main Content pane */
        .admin-main-panel {
          flex: 1;
          margin-left: 260px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
        }

        .admin-header-left h2 {
          font-size: 1.6rem;
          font-weight: 800;
        }

        .admin-header-left p {
          font-size: 0.85rem;
          color: hsl(var(--text-secondary));
        }

        .admin-header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .date-picker-widget {
          padding: 8px 14px;
          background-color: white;
          border: 1px solid hsl(var(--border-color));
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 600;
          color: hsl(var(--text-primary));
        }

        .admin-search-container {
          position: relative;
        }

        .admin-search-container .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: hsl(var(--text-muted));
        }

        .admin-search-container input {
          background-color: white;
          border: 1px solid hsl(var(--border-color));
          border-radius: var(--radius-sm);
          padding: 8px 14px 8px 34px;
          font-size: 0.8rem;
          color: hsl(var(--text-primary));
          outline: none;
          width: 180px;
        }

        .admin-notify-btn {
          width: 36px;
          height: 36px;
          border: 1px solid hsl(var(--border-color));
          background: white;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
        }

        .admin-notify-btn .badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: hsl(var(--accent-red));
          color: white;
          font-size: 0.6rem;
          font-weight: 700;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-avatar-card {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px 4px 4px;
          border: 1px solid hsl(var(--border-color));
          background: white;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .admin-avatar-card img {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          object-fit: cover;
        }

        /* Grid elements content */
        .admin-content-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .admin-stats-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }

        .admin-stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
        }

        .admin-stat-card .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          font-size: 1.3rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-blue { background-color: rgba(37,99,235,0.08); color: #2563eb; }
        .icon-green { background-color: rgba(16,185,129,0.08); color: #10b981; }
        .icon-purple { background-color: rgba(139,92,246,0.08); color: #8b5cf6; }
        .icon-orange { background-color: rgba(245,158,11,0.08); color: #f59e0b; }
        .icon-red { background-color: rgba(239,68,68,0.08); color: #ef4444; }

        .stat-desc {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .stat-desc span {
          font-size: 0.75rem;
          font-weight: 600;
          color: hsl(var(--text-secondary));
        }

        .stat-desc h3 {
          font-family: var(--font-title);
          font-size: 1.45rem;
          font-weight: 800;
          line-height: 1.2;
          margin: 2px 0 4px;
        }

        .trend-green {
          font-size: 0.7rem;
          font-weight: 700;
          color: #10b981;
        }

        .trend-red {
          font-size: 0.7rem;
          font-weight: 700;
          color: #ef4444;
        }

        .trend-lbl {
          font-weight: 500;
          color: hsl(var(--text-muted));
        }

        /* Charts Row */
        .admin-charts-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .chart-card-wrapper {
          padding: 24px;
          background: white;
          display: flex;
          flex-direction: column;
        }

        .col-span-2 {
          grid-column: span 1;
        }

        @media (min-width: 1200px) {
          .col-span-2 {
            grid-column: span 2;
          }
          .admin-charts-row {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .chart-header h3 {
          font-size: 1rem;
        }

        .date-select-dropdown {
          background-color: transparent;
          border: 1px solid hsl(var(--border-color));
          border-radius: var(--radius-sm);
          padding: 4px 8px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .revenue-large-summary h2 {
          font-family: var(--font-title);
          font-size: 1.8rem;
          font-weight: 800;
          line-height: 1.1;
        }

        .line-chart-svg-container {
          margin-top: 14px;
          flex: 1;
          display: flex;
          align-items: flex-end;
        }

        .line-chart-svg {
          width: 100%;
          height: auto;
          max-height: 160px;
        }

        /* Donut Chart styles */
        .donut-chart-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 14px;
          flex: 1;
        }

        .donut-svg-wrapper {
          position: relative;
          width: 110px;
          height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .donut-inner-text {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .donut-inner-text strong {
          font-size: 0.95rem;
          font-weight: 800;
          line-height: 1.1;
          color: hsl(var(--text-primary));
        }

        .donut-inner-text span {
          font-size: 0.55rem;
          color: hsl(var(--text-muted));
          font-weight: 500;
          text-transform: uppercase;
        }

        .donut-legend-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          font-weight: 500;
          color: hsl(var(--text-secondary));
        }

        .legend-item .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .dot-blue { background-color: #2563eb; }
        .dot-green { background-color: #10b981; }
        .dot-yellow { background-color: #f59e0b; }
        .dot-purple { background-color: #8b5cf6; }
        .dot-cyan { background-color: #06b6d4; }

        /* Tables and panels columns grid */
        .admin-tables-row-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 992px) {
          .admin-tables-row-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .admin-tables-row-grid .col-span-2 {
            grid-column: span 2;
          }
        }

        .admin-card-panel {
          padding: 24px;
          background: white;
        }

        .admin-card-panel h3 {
          font-size: 1rem;
        }

        .panel-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-subtitle-lbl {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          color: hsl(var(--text-secondary));
          margin: 16px 0 10px;
          display: block;
          letter-spacing: 0.05em;
        }

        .payments-mini-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .payments-stat-sub-card {
          background-color: #f8fafc;
          border: 1px solid hsl(var(--border-color));
          border-radius: var(--radius-sm);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          border-left: 3.5px solid #2563eb;
        }

        .payments-stat-sub-card.border-green { border-left-color: #10b981; }
        .payments-stat-sub-card.border-yellow { border-left-color: #f59e0b; }
        .payments-stat-sub-card.border-red { border-left-color: #ef4444; }

        .payments-stat-sub-card span {
          font-size: 0.65rem;
          font-weight: 600;
          color: hsl(var(--text-muted));
        }

        .payments-stat-sub-card h4 {
          font-family: var(--font-title);
          font-size: 0.95rem;
          font-weight: 800;
        }

        /* Generic Admin Tables */
        .admin-data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .admin-data-table th, .admin-data-table td {
          padding: 12px 14px;
          font-size: 0.8rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .admin-data-table th {
          font-weight: 700;
          color: hsl(var(--text-muted));
          text-transform: uppercase;
          font-size: 0.7rem;
          letter-spacing: 0.05em;
          background-color: #f8fafc;
        }

        .font-table td {
          font-size: 0.78rem;
        }

        /* Progress List (Active Students) */
        .active-students-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .active-student-progress-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .active-student-progress-row .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .active-student-progress-row .progress-labels .course-name {
          color: hsl(var(--text-primary));
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 80%;
        }

        .active-student-progress-row .progress-labels .student-count {
          color: hsl(var(--text-secondary));
        }

        .progress-container-bar {
          height: 6px;
          background: #f1f5f9;
          border-radius: 10px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .progress-fill-bar {
          height: 100%;
          background: #10b981;
          border-radius: 10px;
        }

        .progress-container-bar .percent-label {
          position: absolute;
          right: 0;
          top: -18px;
          font-size: 0.65rem;
          font-weight: 700;
          color: hsl(var(--text-muted));
        }

        /* Recent Enrollments List */
        .recent-enrollments-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .enrollment-list-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px;
          border-radius: var(--radius-sm);
          transition: background-color var(--transition-fast);
        }

        .enrollment-list-item:hover {
          background-color: #f8fafc;
        }

        .enrollment-list-item .user-avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid #e2e8f0;
        }

        .enrollment-list-item .user-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .enrollment-list-item .user-details strong {
          font-size: 0.8rem;
          color: hsl(var(--text-primary));
        }

        .enrollment-list-item .user-details span {
          font-size: 0.7rem;
          color: hsl(var(--text-muted));
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 140px;
        }

        .enrollment-list-item .time-lbl {
          font-size: 0.65rem;
          color: hsl(var(--text-muted));
          font-weight: 500;
        }

        /* Upload Videos Panel */
        .upload-dropzone-box {
          border: 1.5px dashed #cbd5e1;
          border-radius: var(--radius-sm);
          background: #f8fafc;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }

        .upload-dropzone-box:hover {
          border-color: #2563eb;
        }

        .upload-dropzone-box .upload-icon {
          font-size: 1.8rem;
          margin-bottom: 6px;
        }

        .upload-dropzone-box strong {
          font-size: 0.8rem;
          color: hsl(var(--text-primary));
        }

        .upload-dropzone-box span {
          font-size: 0.75rem;
          color: hsl(var(--text-secondary));
        }

        .recent-uploads-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .upload-file-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 8px 10px;
          border-radius: var(--radius-sm);
        }

        .upload-file-item .file-icon {
          font-size: 1.1rem;
        }

        .upload-file-item .file-meta {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .upload-file-item .file-meta strong {
          font-size: 0.75rem;
          color: hsl(var(--text-primary));
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 140px;
        }

        .upload-file-item .file-meta span {
          font-size: 0.65rem;
          color: hsl(var(--text-muted));
        }

        .upload-file-item .file-size-lbl {
          font-size: 0.7rem;
          font-weight: 700;
          color: hsl(var(--text-secondary));
        }

        /* System overview stats */
        .system-overview-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 10px;
        }

        .sys-stat-item {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-sm);
          padding: 12px;
          display: flex;
          flex-direction: column;
        }

        .sys-stat-item span {
          font-size: 0.7rem;
          font-weight: 600;
          color: hsl(var(--text-muted));
        }

        .sys-stat-item strong {
          font-family: var(--font-title);
          font-size: 1.15rem;
          font-weight: 800;
          color: hsl(var(--text-primary));
          margin-top: 2px;
        }

        .status-dot-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #10b981;
          display: inline-block;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .icon-action-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 0.95rem;
          padding: 2px;
          transition: transform 0.15s ease;
        }

        .icon-action-btn:hover {
          transform: scale(1.15);
        }

        @media (max-width: 1200px) {
          .admin-sidebar {
            display: none;
          }
          .admin-main-panel {
            margin-left: 0;
          }
          .admin-stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .admin-stats-row {
            grid-template-columns: 1fr;
          }
          .payments-mini-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

    </div>
  );
};

export default AdminDashboard;
