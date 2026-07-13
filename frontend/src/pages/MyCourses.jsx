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

  // Custom Video Player States
  const videoRef = React.useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipTime = (amount) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + amount));
  };

  const cycleSpeed = () => {
    if (!videoRef.current) return;
    const speeds = [1, 1.25, 1.5, 2];
    const currentIdx = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIdx + 1) % speeds.length];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    const container = videoRef.current.parentElement;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleProgressClick = (e) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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

          {/* Custom Video Player Container */}
          <div className="video-player-container glass-panel" style={{ position: 'relative' }}>
            <video
              ref={videoRef}
              src={activeLesson?.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'}
              className="course-video"
              onClick={togglePlay}
              onTimeUpdate={() => setCurrentTime(videoRef.current ? videoRef.current.currentTime : 0)}
              onLoadedMetadata={() => setDuration(videoRef.current ? videoRef.current.duration : 0)}
              onEnded={() => setIsPlaying(false)}
            />

            {/* Browser Mock Poster Overlay when paused and at beginning */}
            {!isPlaying && currentTime === 0 && (
              <div className="custom-video-poster-overlay" onClick={togglePlay}>
                <div className="poster-left">
                  <h1>Introduction to <br/>UI/UX Design</h1>
                  <p>Understanding the basics and the design thinking process.</p>
                </div>
                <div className="poster-right">
                  <div className="mock-browser-window">
                    <div className="browser-header">
                      <span className="browser-dot dot-red"></span>
                      <span className="browser-dot dot-yellow"></span>
                      <span className="browser-dot dot-green"></span>
                      <div className="browser-address-bar"></div>
                    </div>
                    <div className="browser-content">
                      <div className="ui-badge-logo">UI</div>
                      <div className="text-line long"></div>
                      <div className="text-line short"></div>
                      <div className="design-elements-row">
                        <div className="mock-image-box">🖼️</div>
                        <div className="mock-text-box">
                          <span className="cursor-t">T</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Big Play Button Overlay */}
                <div className="big-play-btn-circle">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              </div>
            )}

            {/* Custom Video Control Bar */}
            <div className="custom-player-controls">
              
              {/* Progress Slider Track */}
              <div className="progress-slider-bar" onClick={handleProgressClick}>
                <div 
                  className="progress-slider-fill" 
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                ></div>
                <div 
                  className="progress-slider-handle"
                  style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
                ></div>
              </div>

              <div className="controls-row-buttons">
                <div className="left-controls">
                  <button className="control-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                    {isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    )}
                  </button>
                  
                  {/* Rewind 10s */}
                  <button className="control-btn rewind-btn" onClick={() => skipTime(-10)} aria-label="Rewind 10s">
                    <svg className="rewind-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0-.57-8.38l.57 1.39"/>
                    </svg>
                    <span className="rewind-seconds-text">10</span>
                  </button>

                  {/* Speaker */}
                  <button className="control-btn" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                    {isMuted || volume === 0 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6m0-6l6 6"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                    )}
                  </button>

                  <span className="time-display">
                    {formatTime(currentTime)} / {formatTime(duration || 765)}
                  </span>
                </div>

                <div className="right-controls">
                  {/* Speed selection */}
                  <button className="control-btn speed-btn" onClick={cycleSpeed}>
                    {playbackSpeed}x
                  </button>

                  {/* CC Captions */}
                  <button className="control-btn" aria-label="Captions">
                    <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>CC</span>
                  </button>

                  {/* Settings Gear */}
                  <button className="control-btn" aria-label="Settings">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                  </button>

                  {/* Fullscreen */}
                  <button className="control-btn" onClick={toggleFullscreen} aria-label="Fullscreen">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
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
            {(course?.sections && course.sections.length > 0 ? course.sections : [
              {
                title: 'Section 1: Introduction to UI/UX',
                lessons: [
                  { id: 'l1', title: 'What is UI/UX Design?', duration: '08:15', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                  { id: 'l2', title: 'Design Thinking Process', duration: '12:45', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                  { id: 'l3', title: 'User Needs and Goals', duration: '10:20', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                  { id: 'l4', title: 'UI vs UX: Key Differences', duration: '07:30', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                  { id: 'l5', title: 'Career Opportunities in UI/UX', duration: '09:10', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }
                ]
              },
              { title: 'Section 2: User Research', lessons: [] },
              { title: 'Section 3: Wireframing', lessons: [] },
              { title: 'Section 4: Design Principles', lessons: [] },
              { title: 'Section 5: Prototyping', lessons: [] },
              { title: 'Section 6: Tools & Handoff', lessons: [] }
            ]).map((section, sIdx) => (
              <div key={section._id || sIdx} className="section-accordion-item">
                <button 
                  className={`section-accordion-header ${expandedSections[sIdx] ? 'open' : ''}`}
                  onClick={() => toggleSection(sIdx)}
                >
                  <span>{section.title}</span>
                  {expandedSections[sIdx] ? (
                    <span className="accordion-arrow open">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                    </span>
                  ) : (
                    <div className="section-meta-collapsed" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="lesson-count-label" style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', fontWeight: '500' }}>
                        {sIdx === 1 ? '5 Lessons' : sIdx === 2 ? '4 Lessons' : sIdx === 3 ? '5 Lessons' : sIdx === 4 ? '4 Lessons' : sIdx === 5 ? '3 Lessons' : '5 Lessons'}
                      </span>
                      <span className="accordion-arrow">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                      </span>
                    </div>
                  )}
                </button>

                {expandedSections[sIdx] && (
                  <div className="lessons-accordion-content">
                    {section.lessons && section.lessons.length > 0 ? (
                      section.lessons.map((lesson, lIdx) => {
                        const isSelected = activeLesson?.id === lesson.id || (activeLesson === null && lesson.id === 'l2');
                        const isCompleted = completedLessons?.includes(lesson.id) || (lesson.id === 'l1' || lesson.id === 'l3');

                        return (
                          <div 
                            key={lesson.id} 
                            className={`playlist-lesson-row ${isSelected ? 'active' : ''}`}
                            onClick={() => handleSelectLesson(lesson)}
                          >
                            <div className="row-left">
                              {isCompleted ? (
                                <span 
                                  className="lesson-state-icon checked"
                                  onClick={(e) => handleToggleComplete(lesson.id, e)}
                                >
                                  ✓
                                </span>
                              ) : isSelected ? (
                                <span 
                                  className="lesson-state-icon active-indicator"
                                  onClick={(e) => handleToggleComplete(lesson.id, e)}
                                >
                                </span>
                              ) : (
                                <span 
                                  className="lesson-state-icon unchecked"
                                  onClick={(e) => handleToggleComplete(lesson.id, e)}
                                >
                                </span>
                              )}
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
          background-color: #0f172a;
          border-radius: var(--radius-md);
          position: relative;
          box-shadow: var(--shadow-lg);
          border: 1px solid hsl(var(--border-color));
          aspect-ratio: 16/9;
        }

        .course-video {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        /* Custom Video Poster Illustration Overlay */
        .custom-video-poster-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(135deg, #f0f4ff 0%, #e1e7ff 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          cursor: pointer;
          z-index: 10;
          user-select: none;
        }

        .poster-left {
          flex: 1;
          max-width: 50%;
        }

        .poster-left h1 {
          font-family: var(--font-title);
          font-weight: 800;
          font-size: 2.2rem;
          line-height: 1.2;
          color: #1e1b4b;
          margin-bottom: 12px;
          text-align: left;
        }

        .poster-left p {
          font-size: 0.95rem;
          color: #4f46e5;
          font-weight: 500;
          line-height: 1.4;
          text-align: left;
        }

        .poster-right {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* Mock browser window graphic */
        .mock-browser-window {
          width: 280px;
          height: 180px;
          background: white;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: transform 0.3s ease;
        }

        .custom-video-poster-overlay:hover .mock-browser-window {
          transform: translateY(-5px);
        }

        .browser-header {
          height: 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          padding: 0 8px;
          gap: 5px;
        }

        .browser-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .dot-red { background-color: #ef4444; }
        .dot-yellow { background-color: #f59e0b; }
        .dot-green { background-color: #10b981; }

        .browser-address-bar {
          flex: 1;
          height: 12px;
          background: #e2e8f0;
          border-radius: 3px;
          margin-left: 8px;
          max-width: 140px;
        }

        .browser-content {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
        }

        .ui-badge-logo {
          width: 32px;
          height: 32px;
          background-color: #2563eb;
          border-radius: 6px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.9rem;
        }

        .text-line {
          height: 6px;
          background: #cbd5e1;
          border-radius: 3px;
        }

        .text-line.long { width: 80%; }
        .text-line.short { width: 50%; }

        .design-elements-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
        }

        .mock-image-box {
          font-size: 1.8rem;
          color: #94a3b8;
        }

        .mock-text-box {
          width: 24px;
          height: 24px;
          border: 1px dashed #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #2563eb;
          font-size: 0.75rem;
        }

        /* Big Play Button Overlay */
        .big-play-btn-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: rgba(37, 99, 235, 0.9);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
          transition: all 0.2s ease;
          pointer-events: none;
        }

        .custom-video-poster-overlay:hover .big-play-btn-circle {
          background-color: #2563eb;
          scale: 1.1;
        }

        /* Video Controls bar */
        .custom-player-controls {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          background: linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.7));
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 15;
          opacity: 0.95;
          transition: opacity 0.3s ease;
        }

        /* Progress track slider */
        .progress-slider-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 10px;
          position: relative;
          cursor: pointer;
          transition: height 0.15s ease;
        }

        .progress-slider-bar:hover {
          height: 6px;
        }

        .progress-slider-fill {
          height: 100%;
          background: #2563eb;
          border-radius: 10px;
          position: absolute;
          left: 0; top: 0;
        }

        .progress-slider-handle {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: none;
        }

        .progress-slider-bar:hover .progress-slider-handle {
          display: block;
        }

        .controls-row-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .left-controls, .right-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .control-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.85);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          transition: color 0.15s ease;
        }

        .control-btn:hover {
          color: white;
        }

        .rewind-btn {
          position: relative;
        }

        .rewind-seconds-text {
          font-size: 0.55rem;
          font-weight: 800;
          position: absolute;
          top: 55%; left: 50%;
          transform: translate(-50%, -50%);
          color: rgba(255, 255, 255, 0.95);
        }

        .time-display {
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
          font-variant-numeric: tabular-nums;
        }

        .speed-btn {
          font-size: 0.8rem;
          font-weight: 700;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 2px 6px;
          border-radius: 4px;
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
          background-color: #10b981;
          color: white;
          font-weight: 700;
          border: 2px solid #10b981;
        }

        .lesson-state-icon.unchecked {
          border: 2px solid #cbd5e1;
          background: white;
        }

        .lesson-state-icon.active-indicator {
          border: 2px solid #2563eb;
          background: white;
          position: relative;
        }

        .lesson-state-icon.active-indicator::after {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #2563eb;
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
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
