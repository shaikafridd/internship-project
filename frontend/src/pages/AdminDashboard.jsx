import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await adminAPI.getDashboard();
        if (res.success && res.data) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to load admin stats from backend:', err);
      }
    };

    const fetchCoursesAndPayments = async () => {
      try {
        const courseRes = await adminAPI.getCourses();
        if (courseRes.success && courseRes.data) {
          setCourses(courseRes.data);
        }
        const paymentRes = await adminAPI.getPayments();
        if (paymentRes.success && paymentRes.data) {
          setPayments(paymentRes.data);
        }
      } catch (err) {
        console.error('Failed to load admin data from backend:', err);
      }
    };

    fetchAdminStats();
    fetchCoursesAndPayments();
  }, []);

  // Modals / Editing States
  const [editCourseId, setEditCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState({ name: '', instructor: '', price: '', status: 'Published' });
  const [editPaymentId, setEditPaymentId] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ student: '', course: '', amount: '', status: '' });

  // Course Actions
  const handleEditCourse = (course) => {
    setEditCourseId(course.id);
    setCourseForm({ name: course.name, instructor: course.instructor, price: course.price, status: course.status });
  };

  const handleAddNewCourse = () => {
    setEditCourseId('new');
    setCourseForm({ name: '', instructor: '', price: '', status: 'Published' });
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      if (editCourseId === 'new') {
        const res = await adminAPI.createCourse(courseForm);
        if (res.success && res.data) {
          setCourses([...courses, res.data]);
        }
      } else {
        const res = await adminAPI.updateCourse(editCourseId, courseForm);
        if (res.success && res.data) {
          setCourses(courses.map(c => c.id === editCourseId ? res.data : c));
        }
      }
    } catch (err) {
      console.error('Failed to save course', err);
    }
    setEditCourseId(null);
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        const res = await adminAPI.deleteCourse(id);
        if (res.success) {
          setCourses(courses.filter(c => c.id !== id));
        }
      } catch (err) {
        console.error('Failed to delete course', err);
      }
    }
  };

  const toggleCourseStatus = async (id) => {
    const course = courses.find(c => c.id === id);
    if (!course) return;
    const newStatus = course.status === 'Published' ? 'Draft' : 'Published';
    try {
      const res = await adminAPI.updateCourse(id, { status: newStatus });
      if (res.success && res.data) {
        setCourses(courses.map(c => c.id === id ? { ...c, status: newStatus } : c));
      }
    } catch (err) {
      console.error('Failed to toggle course status', err);
    }
  };

  // Payment Actions
  const handleEditPayment = (payment) => {
    setEditPaymentId(payment.id);
    setPaymentForm({ student: payment.student, course: payment.course, amount: payment.amount, status: payment.status });
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.updatePaymentStatus(editPaymentId);
      if (res.success) {
        setPayments(payments.map(p => p.id === editPaymentId ? { ...p, status: p.status === 'Paid' ? 'Pending' : 'Paid' } : p));
      }
    } catch (err) {
      console.error('Failed to update payment status', err);
    }
    setEditPaymentId(null);
  };

  const handleDeletePayment = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment record?")) {
      try {
        const res = await adminAPI.deletePayment(id);
        if (res.success) {
          setPayments(payments.filter(p => p.id !== id));
        }
      } catch (err) {
        console.error('Failed to delete payment', err);
      }
    }
  };

  const togglePaymentStatus = async (id) => {
    try {
      const res = await adminAPI.updatePaymentStatus(id);
      if (res.success) {
        setPayments(payments.map(p => p.id === id ? { ...p, status: p.status === 'Paid' ? 'Pending' : 'Paid' } : p));
      }
    } catch (err) {
      console.error('Failed to toggle payment status', err);
    }
  };

  // Static stats derived from state totals
  const totalRevenueNumber = payments
    .filter(p => p.status === 'Paid' || p.status === 'Completed')
    .reduce((sum, p) => sum + parseInt((p.amount || '').toString().replace(/[^0-9]/g, ''), 10), 0);

  const formatCurrency = (num) => {
    return '₹' + num.toLocaleString('en-IN');
  };

  return (
    <div className="admin-main-panel" style={{ marginLeft: 0, padding: '20px 0', width: '100%' }}>

      {/* Grid Container Content */}
      <div className="admin-content-grid">

        {/* ROW 1: 5 STAT CARDS */}
        <div className="admin-stats-row">
          <div className="admin-stat-card glass-panel">
            <div className="stat-icon icon-blue">👥</div>
            <div className="stat-desc">
              <span>Total Students</span>
              <h3>{stats?.totalStudents?.toLocaleString('en-IN') || '12,845'}</h3>
              <span className="trend-green">↑ 12.5% <span className="trend-lbl">vs last week</span></span>
            </div>
          </div>

          <div className="admin-stat-card glass-panel">
            <div className="stat-icon icon-green">📖</div>
            <div className="stat-desc">
              <span>Active Courses</span>
              <h3>{stats?.activeCourses || courses.length}</h3>
              <span className="trend-green">↑ 8.3% <span className="trend-lbl">vs last week</span></span>
            </div>
          </div>

          <div className="admin-stat-card glass-panel">
            <div className="stat-icon icon-purple">🎓</div>
            <div className="stat-desc">
              <span>Total Enrollments</span>
              <h3>{stats?.totalEnrollments?.toLocaleString('en-IN') || '25,671'}</h3>
              <span className="trend-green">↑ 15.7% <span className="trend-lbl">vs last week</span></span>
            </div>
          </div>

          <div className="admin-stat-card glass-panel">
            <div className="stat-icon icon-orange">💰</div>
            <div className="stat-desc">
              <span>Total Revenue</span>
              <h3>{stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : formatCurrency(1860000 + totalRevenueNumber)}</h3>
              <span className="trend-green">↑ 18.6% <span className="trend-lbl">vs last week</span></span>
            </div>
          </div>

          <div className="admin-stat-card glass-panel">
            <div className="stat-icon icon-red">💳</div>
            <div className="stat-desc">
              <span>Pending Payouts</span>
              <h3>{stats?.pendingPayouts ? formatCurrency(stats.pendingPayouts) : '₹2,45,300'}</h3>
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
              <h2>{stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : formatCurrency(1860000 + totalRevenueNumber)}</h2>
              <span className="trend-green">↑ 18.6% vs last week</span>
            </div>

            {/* Vector SVG Line Chart representation */}
            <div className="line-chart-svg-container">
              <svg className="line-chart-svg" viewBox="0 0 500 200">
                <defs>
                  <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="30" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="170" x2="480" y2="170" stroke="#e2e8f0" strokeWidth="1.5" />

                {/* Chart Fill area */}
                <path d="M 30 140 Q 90 90 150 110 T 270 120 T 390 60 T 480 100 L 480 170 L 30 170 Z" fill="url(#chart-glow)" />

                {/* Chart Line path */}
                <path d="M 30 140 Q 90 90 150 110 T 270 120 T 390 60 T 480 100" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />

                {/* Coordinates Markers / Circles */}
                <circle cx="30" cy="140" r="4" fill="white" stroke="hsl(var(--primary))" strokeWidth="2" />
                <circle cx="110" cy="100" r="4" fill="white" stroke="hsl(var(--primary))" strokeWidth="2" />
                <circle cx="190" cy="115" r="4" fill="white" stroke="hsl(var(--primary))" strokeWidth="2" />
                <circle cx="270" cy="120" r="4" fill="white" stroke="hsl(var(--primary))" strokeWidth="2" />
                <circle cx="350" cy="90" r="4" fill="white" stroke="hsl(var(--primary))" strokeWidth="2" />
                <circle cx="430" cy="65" r="5" fill="hsl(var(--primary))" stroke="white" strokeWidth="2" />
                <circle cx="480" cy="100" r="4" fill="white" stroke="hsl(var(--primary))" strokeWidth="2" />

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
                <h4>{stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : formatCurrency(1860000 + totalRevenueNumber)}</h4>
              </div>
              <div className="payments-stat-sub-card border-green">
                <span>Successful Payments</span>
                <h4 style={{ color: '#10b981' }}>{stats?.totalRevenue ? formatCurrency(stats.totalRevenue - 230000) : formatCurrency(1630000 + totalRevenueNumber)}</h4>
              </div>
              <div className="payments-stat-sub-card border-yellow">
                <span>Refunds</span>
                <h4 style={{ color: '#f59e0b' }}>₹1,20,300</h4>
              </div>
              <div className="payments-stat-sub-card border-red">
                <span>Pending Payouts</span>
                <h4 style={{ color: '#ef4444' }}>{stats?.pendingPayouts ? formatCurrency(stats.pendingPayouts) : '₹2,45,300'}</h4>
              </div>
            </div>

            <span className="section-subtitle-lbl">Recent Payments</span>

            {editPaymentId && (
              <form onSubmit={handleSavePayment} className="admin-inline-form glass-panel animate-fade-in" style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 12px' }}>Edit Payment Record</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  <input type="text" placeholder="Student Name" value={paymentForm.student} onChange={e => setPaymentForm({ ...paymentForm, student: e.target.value })} style={{ padding: '6px', fontSize: '0.8rem' }} required />
                  <input type="text" placeholder="Course" value={paymentForm.course} onChange={e => setPaymentForm({ ...paymentForm, course: e.target.value })} style={{ padding: '6px', fontSize: '0.8rem' }} required />
                  <input type="text" placeholder="Amount" value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} style={{ padding: '6px', fontSize: '0.8rem' }} required />
                  <select value={paymentForm.status} onChange={e => setPaymentForm({ ...paymentForm, status: e.target.value })} style={{ padding: '6px', fontSize: '0.8rem' }}>
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
          <div className="panel-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>All Courses (Interactive)</h3>
            <button className="btn btn-primary" onClick={handleAddNewCourse} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>+ Add New Course</button>
          </div>

          {editCourseId && (
            <form onSubmit={handleSaveCourse} className="admin-inline-form glass-panel animate-fade-in" style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 12px' }}>{editCourseId === 'new' ? 'Add New Course' : 'Edit Course Details'}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                <input type="text" placeholder="Course Name" value={courseForm.name} onChange={e => setCourseForm({ ...courseForm, name: e.target.value })} style={{ padding: '6px', fontSize: '0.8rem' }} required />
                <input type="text" placeholder="Instructor" value={courseForm.instructor} onChange={e => setCourseForm({ ...courseForm, instructor: e.target.value })} style={{ padding: '6px', fontSize: '0.8rem' }} required />
                <input type="text" placeholder="Price" value={courseForm.price} onChange={e => setCourseForm({ ...courseForm, price: e.target.value })} style={{ padding: '6px', fontSize: '0.8rem' }} required />
                <select value={courseForm.status} onChange={e => setCourseForm({ ...courseForm, status: e.target.value })} style={{ padding: '6px', fontSize: '0.8rem' }}>
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

      

    </div>
  );
};

export default AdminDashboard;
