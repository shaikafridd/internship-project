import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI, myCoursesAPI } from '../services/api';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Accordion state (expanded section indices)
  const [expandedSections, setExpandedSections] = useState({ 0: true });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch course details
        const courseRes = await coursesAPI.getCourseById(id);
        if (courseRes.success && courseRes.data) {
          setCourse(courseRes.data);
        } else {
          throw new Error(courseRes.message || 'Course details not found');
        }

        // Fetch enrolled courses to check if user already purchased
        try {
          const myCoursesRes = await myCoursesAPI.getMyCourses();
          if (myCoursesRes.success && myCoursesRes.data) {
            const enrolled = myCoursesRes.data.some(
              (enrollment) => enrollment.course?._id === id
            );
            setIsEnrolled(enrolled);
          }
        } catch (e) {
          console.warn('Could not verify enrollment, assuming guest', e.message);
        }

      } catch (err) {
        console.error('Error loading course details', err);
        setError(err.message || 'Unable to load course info');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const toggleSection = (index) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="error-container glass-panel animate-fade-in">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--accent-red))' }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3>Course Not Found</h3>
        <p>{error || 'The requested course does not exist.'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/courses')}>Back to Catalog</button>
      </div>
    );
  }

  return (
    <div className="course-detail-wrapper animate-fade-in">
      {/* Detail Header Banner */}
      <div className="detail-header glass-panel animate-slide-up">
        <div className="header-text">
          <span className="badge badge-secondary">{course.category}</span>
          <h2>{course.title}</h2>
          <p className="description">{course.description}</p>
          <div className="header-meta">
            <span>Instructor: <strong>{course.instructor}</strong></span>
            <span>Duration: <strong>{course.duration}</strong></span>
            <span>Lessons: <strong>{course.lessonsCount}</strong></span>
          </div>
        </div>

        <div className="checkout-panel glass-panel">
          <div className="checkout-info">
            <span className="price-label">One-time Investment</span>
            <div className="price-tag-large">
              <span className="currency">₹</span>
              <span className="amount">{course.price}</span>
            </div>
            <p className="checkout-details">Includes lifetime access, lecture slides, files and certificate of completion.</p>
          </div>

          {isEnrolled ? (
            <button 
              className="btn btn-accent glow-btn" 
              style={{ width: '100%' }}
              onClick={() => navigate(`/my-courses/${course._id}`)}
            >
              Start Learning
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
          ) : (
            <button 
              className="btn btn-primary glow-btn" 
              style={{ width: '100%' }}
              onClick={() => navigate(`/checkout/${course._id}`)}
            >
              Enroll Now
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="12" y1="4" x2="12" y2="20" />
                <line x1="2" y1="12" x2="22" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Syllabus / Sections list */}
      <div className="syllabus-container animate-slide-up">
        <h3>Course Syllabus</h3>
        <p className="syllabus-subtitle">Learn step-by-step with practical hands-on exercises.</p>

        <div className="accordion">
          {course.sections && course.sections.length > 0 ? (
            course.sections.map((section, sIdx) => (
              <div key={section._id || sIdx} className="accordion-item glass-panel">
                <button 
                  className="accordion-trigger" 
                  onClick={() => toggleSection(sIdx)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span className="section-number">0{sIdx + 1}</span>
                    <span className="section-title">{section.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="lessons-tag">{section.lessons?.length || 0} lessons</span>
                    <span className={`chevron ${expandedSections[sIdx] ? 'open' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </div>
                </button>

                {expandedSections[sIdx] && (
                  <div className="accordion-content">
                    {section.lessons && section.lessons.length > 0 ? (
                      section.lessons.map((lesson, lIdx) => (
                        <div key={lesson._id || lIdx} className="lesson-row">
                          <div className="lesson-left">
                            <span className="play-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3" />
                              </svg>
                            </span>
                            <span className="lesson-title">{lesson.title}</span>
                          </div>
                          <span className="lesson-duration">{lesson.duration}</span>
                        </div>
                      ))
                    ) : (
                      <p className="empty-text">No lessons available in this section.</p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="empty-text">No syllabus structure has been added to this course.</p>
          )}
        </div>
      </div>

      <style>{`
        .course-detail-wrapper {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        /* Banner layout */
        .detail-header {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 40px;
          padding: 40px;
          align-items: start;
        }

        .header-text {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .header-text h2 {
          font-size: 2.2rem;
          line-height: 1.25;
        }

        .header-text .description {
          color: hsl(var(--text-secondary));
          line-height: 1.6;
          font-size: 1.05rem;
        }

        .header-meta {
          display: flex;
          gap: 24px;
          font-size: 0.9rem;
          color: hsl(var(--text-muted));
          border-top: 1px solid hsl(var(--border-color));
          padding-top: 16px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .header-meta span strong {
          color: white;
        }

        /* Checkout Panel */
        .checkout-panel {
          padding: 30px;
          background-color: rgba(255,255,255,0.015);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .checkout-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .price-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: hsl(var(--text-muted));
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .price-tag-large {
          display: flex;
          align-items: baseline;
          color: white;
        }

        .price-tag-large .currency {
          font-size: 1.3rem;
          font-weight: 700;
          margin-right: 4px;
        }

        .price-tag-large .amount {
          font-family: var(--font-title);
          font-size: 2.5rem;
          font-weight: 800;
        }

        .checkout-details {
          font-size: 0.85rem;
          color: hsl(var(--text-muted));
          line-height: 1.4;
        }

        /* Syllabus Accordion */
        .syllabus-container {
          max-width: 800px;
        }

        .syllabus-container h3 {
          font-size: 1.5rem;
          margin-bottom: 6px;
        }

        .syllabus-subtitle {
          color: hsl(var(--text-muted));
          margin-bottom: 24px;
          font-size: 0.95rem;
        }

        .accordion {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .accordion-item {
          overflow: hidden;
          transition: var(--transition-fast);
        }

        .accordion-trigger {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: transparent;
          border: none;
          padding: 20px 24px;
          color: white;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
        }

        .section-number {
          font-family: var(--font-title);
          font-size: 1.1rem;
          font-weight: 800;
          color: hsl(var(--primary));
        }

        .section-title {
          font-size: 1.05rem;
          font-weight: 700;
        }

        .lessons-tag {
          font-size: 0.8rem;
          color: hsl(var(--text-muted));
          background-color: hsl(var(--bg-dark));
          padding: 4px 10px;
          border-radius: 4px;
          font-weight: 500;
        }

        .chevron {
          display: flex;
          align-items: center;
          color: hsl(var(--text-muted));
          transition: transform var(--transition-fast);
        }

        .chevron.open {
          transform: rotate(180deg);
          color: hsl(var(--primary));
        }

        .accordion-content {
          border-top: 1px solid hsl(var(--border-color) / 0.5);
          padding: 12px 24px;
          background-color: rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
        }

        .lesson-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid hsl(var(--border-color) / 0.3);
        }

        .lesson-row:last-child {
          border-bottom: none;
        }

        .lesson-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .play-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background-color: hsl(var(--bg-dark));
          border-radius: 50%;
          color: hsl(var(--text-muted));
        }

        .lesson-title {
          font-size: 0.95rem;
          color: hsl(var(--text-secondary));
          font-weight: 500;
        }

        .lesson-duration {
          font-size: 0.85rem;
          color: hsl(var(--text-muted));
          font-weight: 500;
        }

        @media (max-width: 992px) {
          .detail-header {
            grid-template-columns: 1fr;
            gap: 30px;
            padding: 24px;
          }
          .checkout-panel {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CourseDetails;
