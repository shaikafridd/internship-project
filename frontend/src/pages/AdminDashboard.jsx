import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { adminAPI } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const location = useLocation();
  const activeTab = new URLSearchParams(location.search).get('tab') || 'dashboard';

  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  // Messages Mock State
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Aarav Mehta', email: 'aarav@gmail.com', subject: 'Course Certification Issue', content: 'Hi, I completed the UI/UX course but haven\'t received my certificate yet. Can you please check my progress?', date: 'Jul 13, 2026', read: false },
    { id: 2, sender: 'Priya Sharma', email: 'riya.sharma@gmail.com', subject: 'Invoice Receipt Request', content: 'Could I get an invoice receipt for the Advanced JavaScript course? My employer needs it for reimbursement.', date: 'Jul 12, 2026', read: true },
    { id: 3, sender: 'Kabir Singh', email: 'kabir@outlook.com', subject: 'Partnership Inquiry', content: 'Interested in listing our corporate training courses on CareerHub. Who should we contact for onboarding?', date: 'Jul 10, 2026', read: true }
  ]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Settings State
  const [profileForm, setProfileForm] = useState({ username: 'admin', password: '', confirmPassword: '' });
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');



  // Curriculum Management States
  const [manageCurriculumCourse, setManageCurriculumCourse] = useState(null);
  const [workingSections, setWorkingSections] = useState([]);
  const [uploadingLessonKey, setUploadingLessonKey] = useState(null);
  const [lessonUploadProgress, setLessonUploadProgress] = useState(0);

  // Server Info States
  const [serverInfo, setServerInfo] = useState(null);
  const [responseTime, setResponseTime] = useState(null);

  // Fetch admin stats, courses, payments and users
  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const start = performance.now();
        const res = await adminAPI.getDashboard();
        const end = performance.now();
        setResponseTime(Math.round(end - start));
        if (res.success && res.data) {
          setStats(res.data.stats);
          setServerInfo(res.data.serverInfo);
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

    const fetchUsers = async () => {
      try {
        const res = await adminAPI.getUsers();
        if (res.success && res.data) {
          setUsers(res.data);
        }
      } catch (err) {
        console.error('Failed to load users from backend:', err);
      }
    };

    fetchAdminStats();
    fetchCoursesAndPayments();
    fetchUsers();
  }, []);

  // Modals / Editing States
  const [editCourseId, setEditCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState({ name: '', instructor: '', price: '', status: 'Published' });
  const [editPaymentId, setEditPaymentId] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ student: '', course: '', amount: '', status: '' });

  // Course Actions
  const handleEditCourse = (course) => {
    setEditCourseId(course.id);
    setCourseForm({ name: course.name, instructor: course.instructor, price: course.price.replace(/[^0-9]/g, ''), status: course.status });
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
      const cleanAmount = parseInt((paymentForm.amount || '').toString().replace(/[^0-9]/g, ''), 10);
      const payload = {
        status: paymentForm.status === 'Paid' ? 'Completed' : paymentForm.status,
        amount: cleanAmount
      };
      const res = await adminAPI.updatePaymentStatus(editPaymentId, payload);
      if (res.success) {
        setPayments(payments.map(p => p.id === editPaymentId ? {
          ...p,
          amount: `₹${cleanAmount.toLocaleString('en-IN')}`,
          status: paymentForm.status
        } : p));
      }
    } catch (err) {
      console.error('Failed to save payment changes', err);
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
    const payment = payments.find(p => p.id === id);
    if (!payment) return;
    const newStatus = payment.status === 'Paid' ? 'Pending' : 'Paid';
    try {
      const res = await adminAPI.updatePaymentStatus(id, {
        status: newStatus === 'Paid' ? 'Completed' : 'Pending'
      });
      if (res.success) {
        setPayments(payments.map(p => p.id === id ? { ...p, status: newStatus } : p));
      }
    } catch (err) {
      console.error('Failed to toggle payment status', err);
    }
  };

  // Users Actions
  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this student profile? This will revoke dashboard access.")) {
      try {
        const res = await adminAPI.deleteUser(id);
        if (res.success) {
          setUsers(users.filter(u => u.id !== id));
        }
      } catch (err) {
        console.error('Failed to delete user:', err);
      }
    }
  };

  // Messages Actions
  const toggleReadMessage = (id) => {
    setMessages(messages.map(m => m.id === id ? { ...m, read: !m.read } : m));
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage(prev => ({ ...prev, read: !prev.read }));
    }
  };

  const handleDeleteMessage = (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(null);
      }
    }
  };

  // Settings Actions
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');

    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      setSettingsError('Passwords do not match');
      return;
    }

    setSettingsSuccess('Admin profile security parameters updated successfully (simulated).');
  };



  // Curriculum Management Handlers
  const handleSelectCurriculum = (course) => {
    setManageCurriculumCourse(course);
    setWorkingSections(course.sections || []);
  };

  const handleAddSection = () => {
    setWorkingSections([...workingSections, { title: 'New Section', lessons: [] }]);
  };

  const handleEditSectionTitle = (sectionIdx, newTitle) => {
    setWorkingSections(workingSections.map((s, idx) => idx === sectionIdx ? { ...s, title: newTitle } : s));
  };

  const handleDeleteSection = (sectionIdx) => {
    if (window.confirm("Are you sure you want to delete this entire section and all its videos?")) {
      setWorkingSections(workingSections.filter((_, idx) => idx !== sectionIdx));
    }
  };

  const handleAddLesson = (sectionIdx) => {
    const newLesson = {
      id: 'les_' + Math.random().toString(36).substring(2, 9),
      title: 'New Video Lesson',
      duration: '05:00',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
    };
    setWorkingSections(workingSections.map((s, idx) => {
      if (idx === sectionIdx) {
        return { ...s, lessons: [...(s.lessons || []), newLesson] };
      }
      return s;
    }));
  };

  const handleEditLesson = (sectionIdx, lessonIdx, fields) => {
    setWorkingSections(workingSections.map((s, sIdx) => {
      if (sIdx === sectionIdx) {
        const updatedLessons = (s.lessons || []).map((l, lIdx) => {
          if (lIdx === lessonIdx) {
            return { ...l, ...fields };
          }
          return l;
        });
        return { ...s, lessons: updatedLessons };
      }
      return s;
    }));
  };

  const handleDeleteLesson = (sectionIdx, lessonIdx) => {
    if (window.confirm("Are you sure you want to remove this video lesson?")) {
      setWorkingSections(workingSections.map((s, sIdx) => {
        if (sIdx === sectionIdx) {
          return { ...s, lessons: (s.lessons || []).filter((_, lIdx) => lIdx !== lessonIdx) };
        }
        return s;
      }));
    }
  };

  const handleLessonVideoUpload = async (file, sectionIdx, lessonIdx) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      alert('Please upload a valid video file (MP4, WebM, MOV, etc.)');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      alert('File size exceeds the 100MB limit for this sandbox environment.');
      return;
    }

    const key = `${sectionIdx}_${lessonIdx}`;
    setUploadingLessonKey(key);
    setLessonUploadProgress(0);

    try {
      const res = await adminAPI.uploadVideo(file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setLessonUploadProgress(percentCompleted);
      });

      if (res.success && res.data) {
        handleEditLesson(sectionIdx, lessonIdx, { videoUrl: res.data.url });
        alert('Video uploaded successfully!');
      } else {
        alert(res.message || 'Video upload failed');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'An error occurred during video upload');
    } finally {
      setUploadingLessonKey(null);
      setLessonUploadProgress(0);
    }
  };

  const handleSaveCurriculum = async () => {
    try {
      const res = await adminAPI.updateCourse(manageCurriculumCourse.id, {
        sections: workingSections
      });
      if (res.success && res.data) {
        setCourses(courses.map(c => c.id === manageCurriculumCourse.id ? { ...c, sections: res.data.sections } : c));
        alert('Curriculum and video playlist saved successfully!');
        setManageCurriculumCourse(null);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save curriculum changes');
    }
  };

  // Static stats derived from state totals
  const totalRevenueNumber = payments
    .filter(p => p.status === 'Paid' || p.status === 'Completed')
    .reduce((sum, p) => sum + parseInt((p.amount || '').toString().replace(/[^0-9]/g, ''), 10), 0);

  const formatCurrency = (num) => {
    return '₹' + num.toLocaleString('en-IN');
  };

  // Filtered Users list
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.location?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="admin-main-panel" style={{ marginLeft: 0, padding: '20px 0', width: '100%' }}>

      {/* Grid Container Content */}
      <div className="admin-content-grid">

        {/* ─── TAB 1: DASHBOARD VIEW ────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <>
            {/* ROW 1: 5 STAT CARDS */}
            <div className="admin-stats-row">
              <div className="admin-stat-card glass-panel">
                <div className="stat-icon icon-blue">👥</div>
                <div className="stat-desc">
                  <span>Total Students</span>
                  <h3>{stats?.totalStudents?.toLocaleString('en-IN') || users.length}</h3>
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

                    {/* Coordinates Markers */}
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
                  <div className="donut-svg-wrapper">
                    <svg width="120" height="120" viewBox="0 0 42 42" className="donut-svg">
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#e2e8f0" strokeWidth="4.5"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#2563eb" strokeWidth="4.5" strokeDasharray="22 78" strokeDashoffset="25"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#10b981" strokeWidth="4.5" strokeDasharray="19 81" strokeDashoffset="3"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f59e0b" strokeWidth="4.5" strokeDasharray="16 84" strokeDashoffset="84"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#8b5cf6" strokeWidth="4.5" strokeDasharray="15 85" strokeDashoffset="68"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#06b6d4" strokeWidth="4.5" strokeDasharray="12 88" strokeDashoffset="53"></circle>
                    </svg>
                    <div className="donut-inner-text">
                      <strong>{stats?.totalStudents?.toLocaleString('en-IN') || '12,845'}</strong>
                      <span>Total Students</span>
                    </div>
                  </div>

                  <div className="donut-legend-list">
                    <div className="legend-item"><span className="dot dot-blue"></span> <span>UI/UX Design: 2,845 (22%)</span></div>
                    <div className="legend-item"><span className="dot dot-green"></span> <span>Full Stack Web: 2,450 (19%)</span></div>
                    <div className="legend-item"><span className="dot dot-yellow"></span> <span>Python for Data: 2,120 (16%)</span></div>
                    <div className="legend-item"><span className="dot dot-purple"></span> <span>React Bootcamp: 1,890 (15%)</span></div>
                    <div className="legend-item"><span className="dot dot-cyan"></span> <span>Digital Mark: 1,560 (12%)</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 4: ENROLLMENTS, UPLOADS & SYSTEM OVERVIEW */}
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



              {/* Right: System Overview */}
              <div className="admin-card-panel glass-panel">
                <div className="panel-header-row">
                  <h3>System Overview</h3>
                </div>
                <div className="system-overview-stats-grid">
                  <div className="sys-stat-item">
                    <span>Total Users</span>
                    <strong>{users.length}</strong>
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

                <div className="sys-storage-usage-block" style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
                    <span>Storage Usage</span>
                    <span>45.6 GB / 200 GB (22%)</span>
                  </div>
                  <div className="progress-container-bar" style={{ height: '8px' }}>
                    <div className="progress-fill-bar" style={{ width: '22%', backgroundColor: '#2563eb' }}></div>
                  </div>
                </div>

                <div className="sys-server-status-block" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Server Status</span>
                  <span className="status-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>
                    <span className="status-dot-pulse"></span> All Systems Operational
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ─── TAB 2: USERS VIEW ────────────────────────────────────────────── */}
        {activeTab === 'users' && (
          <div className="admin-card-panel glass-panel" style={{ gridColumn: '1 / -1' }}>
            <div className="panel-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'hsl(var(--text-primary))' }}>User & Student Accounts</h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>Manage registered platform student profiles, details, and access tokens.</p>
              </div>
              <div style={{ position: 'relative', width: '300px' }}>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <table className="admin-data-table font-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email Address</th>
                  <th>Location</th>
                  <th>Phone Number</th>
                  <th>Registered On</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 700 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.location}</td>
                      <td>{u.phone}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="icon-action-btn"
                          onClick={() => handleDeleteUser(u.id)}
                          title="Delete User"
                          style={{ color: '#ef4444' }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      No registered students found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── TAB 3: COURSES VIEW ──────────────────────────────────────────── */}
        {activeTab === 'courses' && (
          manageCurriculumCourse ? (
            <div className="admin-card-panel glass-panel" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <button className="btn btn-secondary" onClick={() => setManageCurriculumCourse(null)} style={{ padding: '6px 12px', fontSize: '0.75rem', marginBottom: '8px' }}>
                    ← Back to Course List
                  </button>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'hsl(var(--text-primary))', margin: 0 }}>
                    Manage Curriculum & Videos: {manageCurriculumCourse.name}
                  </h2>
                </div>
                <button className="btn btn-primary" onClick={handleSaveCurriculum} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Save Curriculum Changes
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {workingSections.map((section, sIdx) => (
                  <div key={sIdx} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569' }}>Section {sIdx + 1}:</span>
                        <input 
                          type="text" 
                          value={section.title} 
                          onChange={(e) => handleEditSectionTitle(sIdx, e.target.value)}
                          style={{ fontSize: '0.9rem', fontWeight: 700, border: '1px solid #cbd5e1', borderRadius: '4px', padding: '6px 10px', width: '60%', outline: 'none' }}
                        />
                      </div>
                      <button 
                        type="button"
                        className="btn" 
                        onClick={() => handleDeleteSection(sIdx)}
                        style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#fee2e2', color: '#ef4444', border: 'none' }}
                      >
                        Delete Section
                      </button>
                    </div>

                    {/* Lessons (Videos) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '20px' }}>
                      {(section.lessons || []).map((lesson, lIdx) => {
                        const lessonKey = `${sIdx}_${lIdx}`;
                        const isUploading = uploadingLessonKey === lessonKey;
                        return (
                          <div key={lesson.id || lIdx} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', background: '#ffffff' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: '12px', alignItems: 'center' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Video / Lesson Title</label>
                                <input 
                                  type="text" 
                                  value={lesson.title} 
                                  onChange={(e) => handleEditLesson(sIdx, lIdx, { title: e.target.value })}
                                  style={{ padding: '6px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }}
                                />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Duration (e.g. 10:15)</label>
                                <input 
                                  type="text" 
                                  value={lesson.duration} 
                                  onChange={(e) => handleEditLesson(sIdx, lIdx, { duration: e.target.value })}
                                  style={{ padding: '6px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }}
                                />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Video Media URL</label>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <input 
                                    type="text" 
                                    value={lesson.videoUrl} 
                                    onChange={(e) => handleEditLesson(sIdx, lIdx, { videoUrl: e.target.value })}
                                    style={{ flex: 1, padding: '6px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }}
                                  />
                                  <input 
                                    type="file" 
                                    id={`file_input_${lessonKey}`} 
                                    accept="video/*" 
                                    onChange={(e) => handleLessonVideoUpload(e.target.files[0], sIdx, lIdx)} 
                                    style={{ display: 'none' }}
                                  />
                                  <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    disabled={isUploading}
                                    onClick={() => document.getElementById(`file_input_${lessonKey}`).click()}
                                    style={{ padding: '6px 10px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                                  >
                                    {isUploading ? 'Uploading...' : 'Upload Video ☁️'}
                                  </button>
                                </div>
                                {isUploading && (
                                  <div style={{ height: '4px', width: '100%', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
                                    <div style={{ height: '100%', width: `${lessonUploadProgress}%`, background: '#2563eb', transition: 'width 0.2s' }}></div>
                                  </div>
                                )}
                              </div>
                              <button 
                                type="button"
                                className="icon-action-btn" 
                                onClick={() => handleDeleteLesson(sIdx, lIdx)} 
                                title="Delete Lesson"
                                style={{ color: '#ef4444', alignSelf: 'center', marginTop: '16px' }}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      <button 
                        type="button"
                        className="btn btn-secondary" 
                        onClick={() => handleAddLesson(sIdx)}
                        style={{ alignSelf: 'flex-start', padding: '4px 10px', fontSize: '0.75rem', marginTop: '8px' }}
                      >
                        + Add Lesson/Video
                      </button>
                    </div>
                  </div>
                ))}

                <button 
                  type="button"
                  className="btn btn-primary" 
                  onClick={handleAddSection}
                  style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  + Add New Section
                </button>
              </div>
            </div>
          ) : (
            <div className="admin-card-panel glass-panel" style={{ gridColumn: '1 / -1' }}>
              <div className="panel-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'hsl(var(--text-primary))' }}>All Courses (Interactive)</h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>Manage the curriculum courses available for user checkouts.</p>
                </div>
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
                          <button className="icon-action-btn" onClick={() => handleSelectCurriculum(c)} title="Manage Curriculum/Videos">🎥</button>
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
          )
        )}

        {/* ─── TAB 4: PAYMENTS VIEW ─────────────────────────────────────────── */}
        {activeTab === 'payments' && (
          <div className="admin-card-panel glass-panel" style={{ gridColumn: '1 / -1' }}>
            <div className="panel-header-row" style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'hsl(var(--text-primary))' }}>Payments & Transactions</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>Review and edit purchase payments, orders, and pending payouts.</p>
            </div>

            {/* Payments overview sub-blocks */}
            <div className="payments-mini-stats-grid" style={{ marginBottom: '24px' }}>
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

            {editPaymentId && (
              <form onSubmit={handleSavePayment} className="admin-inline-form glass-panel animate-fade-in" style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 12px' }}>Edit Payment Record</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  <input type="text" placeholder="Student Name" value={paymentForm.student} onChange={e => setPaymentForm({ ...paymentForm, student: e.target.value })} style={{ padding: '6px', fontSize: '0.8rem' }} disabled />
                  <input type="text" placeholder="Course" value={paymentForm.course} onChange={e => setPaymentForm({ ...paymentForm, course: e.target.value })} style={{ padding: '6px', fontSize: '0.8rem' }} disabled />
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
                        className={`badge ${p.status === 'Paid' || p.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}
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
        )}

        {/* ─── TAB 5: MESSAGES VIEW ────────────────────────────────────────── */}
        {activeTab === 'messages' && (
          <div className="admin-card-panel glass-panel" style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
            <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px', color: 'hsl(var(--text-primary))' }}>Inbox Messages</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 20px' }}>Manage user feedback and customer support tickets.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.map(m => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMessage(m)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: selectedMessage?.id === m.id ? 'hsl(var(--primary) / 0.06)' : '#f8fafc',
                      border: selectedMessage?.id === m.id ? '1px solid hsl(var(--primary) / 0.3)' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    {!m.read && <span style={{ position: 'absolute', top: '12px', right: '12px', width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }}></span>}
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a' }}>{m.sender}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', margin: '2px 0 6px' }}>{m.subject}</span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{m.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {selectedMessage ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{selectedMessage.subject}</h3>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>From: {selectedMessage.sender} ({selectedMessage.email})</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary" onClick={() => toggleReadMessage(selectedMessage.id)} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                          Mark as {selectedMessage.read ? 'Unread' : 'Read'}
                        </button>
                        <button className="btn" onClick={() => handleDeleteMessage(selectedMessage.id)} style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#fee2e2', color: '#ef4444', border: 'none' }}>
                          Delete
                        </button>
                      </div>
                    </div>

                    <div style={{ padding: '20px 0', fontSize: '0.95rem', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                      {selectedMessage.content}
                    </div>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); alert('Reply message sent successfully (simulated).'); }} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>Admin Response</label>
                    <textarea
                      placeholder="Type a response to send to student email..."
                      rows="4"
                      required
                      style={{ width: '100%', padding: '10px', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', resize: 'none', marginBottom: '12px' }}
                    ></textarea>
                    <button type="submit" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>Send Reply</button>
                  </form>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                  <span>✉️</span>
                  <p style={{ margin: '8px 0 0', fontSize: '0.9rem' }}>Select a support message from the left to view details and draft replies.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 6: SETTINGS VIEW ────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="admin-card-panel glass-panel" style={{ gridColumn: '1 / -1' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px', color: 'hsl(var(--text-primary))' }}>Platform Settings & Server Control</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 24px' }}>Monitor cluster specifications, configure auth keys, and change admin credentials.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              {/* Left Column: Security Settings */}
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Security & Credentials</h3>

                {settingsSuccess && (
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.8rem' }}>
                    ✓ {settingsSuccess}
                  </div>
                )}
                {settingsError && (
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.8rem' }}>
                    ⚠️ {settingsError}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Admin Username</label>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      required
                      style={{ padding: '8px', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>New Password</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep current password"
                      value={profileForm.password}
                      onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                      style={{ padding: '8px', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                      style={{ padding: '8px', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.8rem', marginTop: '6px' }}>
                    Save Credentials
                  </button>
                </form>
              </div>

              {/* Right Column: Server Operational Statistics */}
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Server Operational Status</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Mongoose Database Status:</span>
                    <strong style={{ fontSize: '0.85rem', color: serverInfo?.dbStatus ? '#10b981' : '#f59e0b' }}>
                      {serverInfo?.dbStatus || 'Connecting...'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Response Time:</span>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                      {responseTime !== null ? `~${responseTime}ms` : 'Calculating...'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Node Environment:</span>
                    <strong style={{ fontSize: '0.85rem', color: serverInfo?.nodeEnv === 'production' ? '#10b981' : '#2563eb', textTransform: 'uppercase' }}>
                      {serverInfo?.nodeEnv || 'development'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>API Port:</span>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                      {serverInfo?.port || '5000'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Client Deployment:</span>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                      {window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                        ? `${window.location.port || '5173'} (Vite Local)` 
                        : 'Netlify (Production)'}
                    </strong>
                  </div>
                  {serverInfo?.memoryUsage && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Heap Memory Usage:</span>
                      <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        {serverInfo.memoryUsage}
                      </strong>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '24px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#475569' }}>System Cache Management</h4>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={() => alert('System caches cleared successfully.')} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Clear Cache</button>
                    <button className="btn" onClick={() => alert('Worker restarted.')} style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#fee2e2', color: '#ef4444', border: 'none' }}>Restart Worker</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
