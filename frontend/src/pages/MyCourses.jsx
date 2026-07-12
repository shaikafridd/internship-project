import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { myCoursesAPI } from '../services/api';

const MyCourses = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active Lesson state
  const [activeLesson, setActiveLesson] = useState(null);
  const [completingIds, setCompletingIds] = useState({});
  const [activeTab, setActiveTab] = useState('Overview');
  const [expandedSections, setExpandedSections] = useState({ 0: true });

  const fetchEnrollment = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await myCoursesAPI.getMyCourseById(courseId);
      if (res.success && res.data) {
        setEnrollment(res.data);
        
        // Auto-select first lesson
        const firstSec = res.data.course?.sections?.[0];
        const firstLes = firstSec?.lessons?.[0];
        if (!activeLesson && firstLes) {
          setActiveLesson(firstLes);
        }
      } else {
        throw new Error(res.message || 'Failed to load course viewer');
      }
    } catch (err) {
      console.error('Error fetching enrolled course', err);
      setError(err.message || 'Unable to load course player');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollment();
  }, [courseId]);

  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSelectLesson = (lesson) => {
    setActiveLesson(lesson);
  };

  const handleToggleComplete = async (lessonId, e) => {
    e.stopPropagation();
    if (completingIds[lessonId]) return;

    setCompletingIds(prev => ({ ...prev, [lessonId]: true }));
    try {
      const res = await myCoursesAPI.toggleLessonComplete(courseId, lessonId);
      if (res.success && res.data) {
        await fetchEnrollment(true);
      }
    } catch (err) {
      console.error('Error updating completion progress', err);
    } finally {
      setCompletingIds(prev => ({ ...prev, [lessonId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="error-container glass-panel animate-fade-in">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--accent-red))' }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3>Course Player Unavailable</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
      </div>
    );
  }

  const { course, progress, completedLessons, status } = enrollment;

  return (
    <div className="course-player-wrapper animate-fade-in">
      
      {/* Breadcrumb row */}
      <div className="course-breadcrumb">
        <Link to="/courses">&larr; My Courses</Link>
        <span>&gt;</span>
        <span className="current">{course?.title || 'UI/UX Design Fundamentals'}</span>
      </div>

      {/* Main Grids */}
      <div className="player-grid">
        
        {/* Left Column: Player & Meta */}
        <div className="video-column">
          
          {/* Header Title with Progress Bar (matches Image 1) */}
          <div className="player-header-card glass-panel">
            <div className="header-top-row">
              <h2>{course?.title || 'UI/UX Design Fundamentals'}</h2>
              <div className="header-icons">
                <button className="icon-btn" aria-label="Bookmark">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                </button>
                <button className="icon-btn" aria-label="Download">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                </button>
                <button className="icon-btn" aria-label="Fullscreen">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                </button>
              </div>
            </div>

            <div className="overall-progress-bar-row">
              <span className="label">Overall Progress</span>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="percent-label">{progress}%</span>
            </div>
          </div>

          {/* HTML5 Video Player */}
          <div className="video-player-container glass-panel">
            <video
              src={activeLesson?.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'}
              controls
              className="course-video"
              poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"
            />
          </div>

          {/* Navigation tabs */}
          <div className="player-tabs">
            {['Overview', 'Notes', 'Resources', 'Q&A', 'Announcements'].map((tab) => (
              <button
                key={tab}
                className={`player-tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'Overview' && <span style={{ marginRight: '6px' }}>ℹ️</span>}
                {tab === 'Notes' && <span style={{ marginRight: '6px' }}>📝</span>}
                {tab === 'Resources' && <span style={{ marginRight: '6px' }}>📁</span>}
                {tab === 'Q&A' && <span style={{ marginRight: '6px' }}>💬</span>}
                {tab === 'Announcements' && <span style={{ marginRight: '6px' }}>📢</span>}
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content Panel */}
          {activeTab === 'Overview' && (
            <div className="overview-tab-content glass-panel">
              <div className="about-lesson-section">
                <h3>About This Lesson</h3>
                <p>In this lesson, we'll dive into the fundamentals of UI/UX design, its importance, key principles, and how it impacts user experience.</p>
              </div>

              {/* Lesson Specs */}
              <div className="lesson-specs-grid">
                <div className="spec-box">
                  <span className="label">Duration</span>
                  <p>{activeLesson?.duration || '12:45'} min</p>
                </div>
                <div className="spec-box">
                  <span className="label">Video Size</span>
                  <p>1080p</p>
                </div>
                <div className="spec-box">
                  <span className="label">Instructor</span>
                  <p>James Carter</p>
                </div>
                <div className="spec-box">
                  <span className="label">Published</span>
                  <p>Jan 12, 2024</p>
                </div>
              </div>

              {/* Checklist details */}
              <div className="syllabus-learn-checklist">
                <h4>What You'll Learn</h4>
                <div className="checklist-grid">
                  <div className="check-item">
                    <span className="check-icon">✓</span>
                    <span>What is UI and UX?</span>
                  </div>
                  <div className="check-item">
                    <span className="check-icon">✓</span>
                    <span>The Design Thinking Process</span>
                  </div>
                  <div className="check-item">
                    <span className="check-icon">✓</span>
                    <span>Difference between UI and UX</span>
                  </div>
                  <div className="check-item">
                    <span className="check-icon">✓</span>
                    <span>UI/UX in real life</span>
                  </div>
                  <div className="check-item">
                    <span className="check-icon">✓</span>
                    <span>Key principles of good design</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'Overview' && (
            <div className="overview-tab-content glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
              <p>No content available inside the {activeTab} section for this lesson.</p>
            </div>
          )}

        </div>

        {/* Right Column: Playlist Sections */}
        <div className="playlist-column-card glass-panel">
          <div className="playlist-header">
            <h3>Course Content</h3>
            <span className="lessons-total-label">{course?.lessonsCount || 12} Lessons</span>
          </div>

          <div className="accordion-playlist">
            {(course?.sections || [
              { title: 'Section 1: Introduction to UI/UX', lessons: [] },
              { title: 'Section 2: User Research', lessons: [] },
              { title: 'Section 3: Wireframing', lessons: [] }
            ]).map((section, sIdx) => (
              <div key={section._id || sIdx} className="section-accordion-item">
                <button 
                  className={`section-accordion-header ${expandedSections[sIdx] ? 'open' : ''}`}
                  onClick={() => toggleSection(sIdx)}
                >
                  <span>{section.title}</span>
                  <span className="accordion-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </button>

                {expandedSections[sIdx] && (
                  <div className="lessons-accordion-content">
                    {section.lessons && section.lessons.length > 0 ? (
                      section.lessons.map((lesson, lIdx) => {
                        const isSelected = activeLesson?.id === lesson.id;
                        const isCompleted = completedLessons?.includes(lesson.id);

                        return (
                          <div 
                            key={lesson.id} 
                            className={`playlist-lesson-row ${isSelected ? 'active' : ''}`}
                            onClick={() => handleSelectLesson(lesson)}
                          >
                            <div className="row-left">
                              <span 
                                className={`lesson-state-icon ${isCompleted ? 'checked' : 'unchecked'}`}
                                onClick={(e) => handleToggleComplete(lesson.id, e)}
                              >
                                {isCompleted ? '✓' : ''}
                              </span>
                              <span className="lesson-number-index">{lIdx + 1}.</span>
                              <span className="lesson-title-label">{lesson.title}</span>
                            </div>
                            <span className="lesson-time-label">{lesson.duration}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="empty-section-row">5 Lessons &gt;</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Certificate Banner (matches Image 1) */}
          <div className="playlist-bottom-promo">
            <div className="promo-wrapper">
              <span className="promo-badge-icon">🎖️</span>
              <div className="promo-desc">
                <h4>Complete All Lessons</h4>
                <p>Finish all lessons to earn your completion certificate.</p>
              </div>
            </div>
            <button className="btn btn-secondary view-cert-btn" onClick={() => navigate('/profile')}>
              View Certificate
            </button>
          </div>

          <div className="playlist-support-footer">
            <span>Need help? <a href="/profile">Contact Support</a></span>
          </div>
        </div>

      </div>

      <style>{`
        .course-player-wrapper {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .course-breadcrumb {
          display: flex;
          gap: 8px;
          font-size: 0.85rem;
          color: hsl(var(--text-secondary));
          align-items: center;
        }

        .course-breadcrumb a {
          color: hsl(var(--text-secondary));
          text-decoration: none;
          font-weight: 600;
        }

        .course-breadcrumb a:hover {
          color: hsl(var(--primary));
        }

        .course-breadcrumb span {
          color: hsl(var(--text-muted));
        }

        /* Player Grid */
        .player-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .video-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .player-header-card {
          padding: 20px 24px;
        }

        .header-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .header-top-row h2 {
          font-size: 1.45rem;
          font-weight: 800;
        }

        .header-icons {
          display: flex;
          gap: 10px;
        }

        .icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid hsl(var(--border-color));
          background: white;
          color: hsl(var(--text-secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .icon-btn:hover {
          color: hsl(var(--primary));
          border-color: hsl(var(--primary));
        }

        .overall-progress-bar-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .overall-progress-bar-row .label {
          font-size: 0.8rem;
          font-weight: 600;
          color: hsl(var(--text-secondary));
          white-space: nowrap;
        }

        .overall-progress-bar-row .progress-container {
          flex: 1;
        }

        .overall-progress-bar-row .percent-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: hsl(var(--primary));
        }

        .video-player-container {
          padding: 0;
          overflow: hidden;
          background-color: black;
          border-radius: var(--radius-md);
        }

        .course-video {
          width: 100%;
          display: block;
          aspect-ratio: 16/9;
        }

        /* Tabs under video player */
        .player-tabs {
          display: flex;
          gap: 14px;
          border-bottom: 1px solid hsl(var(--border-color));
        }

        .player-tab-btn {
          background: transparent;
          border: none;
          padding: 12px 14px;
          font-size: 0.9rem;
          font-weight: 600;
          color: hsl(var(--text-secondary));
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: var(--transition-fast);
        }

        .player-tab-btn.active {
          color: hsl(var(--primary));
          border-bottom-color: hsl(var(--primary));
        }

        .overview-tab-content {
          padding: 24px;
        }

        .about-lesson-section h3 {
          font-size: 1.1rem;
          margin-bottom: 8px;
        }

        .about-lesson-section p {
          font-size: 0.9rem;
          color: hsl(var(--text-secondary));
          line-height: 1.5;
        }

        .lesson-specs-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin: 24px 0;
          border-top: 1px solid hsl(var(--border-color));
          border-bottom: 1px solid hsl(var(--border-color));
          padding: 16px 0;
        }

        .spec-box .label {
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
          font-weight: 600;
          display: block;
          margin-bottom: 4px;
        }

        .spec-box p {
          font-size: 0.85rem;
          font-weight: 700;
          color: hsl(var(--text-primary));
        }

        .syllabus-learn-checklist h4 {
          font-size: 0.95rem;
          margin-bottom: 14px;
        }

        .checklist-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .check-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: hsl(var(--text-secondary));
        }

        .check-icon {
          color: hsl(var(--primary));
          font-weight: 700;
        }

        /* Right Playlist Sidebar Column */
        .playlist-column-card {
          padding: 20px 0;
          max-height: calc(100vh - var(--navbar-height) - 100px);
          overflow-y: auto;
        }

        .playlist-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px 16px;
          border-bottom: 1px solid hsl(var(--border-color));
        }

        .playlist-header h3 {
          font-size: 1.05rem;
        }

        .lessons-total-label {
          font-size: 0.8rem;
          color: hsl(var(--text-secondary));
          font-weight: 600;
        }

        .accordion-playlist {
          display: flex;
          flex-direction: column;
        }

        .section-accordion-item {
          border-bottom: 1px solid hsl(var(--border-color) / 0.8);
        }

        .section-accordion-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: transparent;
          border: none;
          font-size: 0.85rem;
          font-weight: 700;
          color: hsl(var(--text-primary));
          cursor: pointer;
          text-align: left;
        }

        .accordion-arrow {
          display: flex;
          align-items: center;
          color: hsl(var(--text-muted));
          transition: transform var(--transition-fast);
        }

        .section-accordion-header.open .accordion-arrow {
          transform: rotate(180deg);
        }

        .lessons-accordion-content {
          padding: 4px 0 12px;
          background-color: #f8fafc;
        }

        .playlist-lesson-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .playlist-lesson-row:hover {
          background-color: hsl(var(--border-color) / 0.3);
        }

        .playlist-lesson-row.active {
          background-color: hsl(var(--primary) / 0.05);
        }

        .playlist-lesson-row .row-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .lesson-state-icon {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          cursor: pointer;
        }

        .lesson-state-icon.checked {
          background-color: hsl(var(--accent-green));
          color: white;
          font-weight: 700;
        }

        .lesson-state-icon.unchecked {
          border: 2px solid hsl(var(--border-color));
          background: white;
        }

        .lesson-number-index {
          font-size: 0.8rem;
          color: hsl(var(--text-muted));
          font-weight: 600;
        }

        .lesson-title-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: hsl(var(--text-secondary));
          line-height: 1.3;
        }

        .playlist-lesson-row.active .lesson-title-label {
          color: hsl(var(--primary));
        }

        .lesson-time-label {
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
          font-weight: 500;
        }

        .empty-section-row {
          padding: 10px 20px;
          font-size: 0.8rem;
          color: hsl(var(--text-muted));
          font-weight: 600;
          cursor: pointer;
        }

        /* Playlist bottom promo card */
        .playlist-bottom-promo {
          margin: 20px;
          padding: 16px;
          background-color: hsl(var(--primary) / 0.05);
          border: 1px solid hsl(var(--primary) / 0.1);
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .promo-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .promo-badge-icon {
          font-size: 1.5rem;
        }

        .promo-desc h4 {
          font-size: 0.85rem;
          font-weight: 700;
        }

        .promo-desc p {
          font-size: 0.75rem;
          color: hsl(var(--text-secondary));
          line-height: 1.3;
        }

        .view-cert-btn {
          width: 100%;
          background: white;
          border: 1px solid hsl(var(--border-color));
          font-size: 0.75rem;
          padding: 8px;
        }

        .playlist-support-footer {
          text-align: center;
          font-size: 0.8rem;
          color: hsl(var(--text-muted));
          margin-top: 10px;
        }

        .playlist-support-footer a {
          color: hsl(var(--primary));
          font-weight: 600;
          text-decoration: none;
        }

        @media (max-width: 992px) {
          .player-grid {
            grid-template-columns: 1fr;
          }
          .playlist-column-card {
            max-height: none;
          }
        }
      `}</style>
    </div>
  );
};

export default MyCourses;
