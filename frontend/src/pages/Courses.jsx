import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesAPI } from '../services/api';

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await coursesAPI.getCourses();
        if (res.success && res.data) {
          setCourses(res.data);
        } else {
          throw new Error(res.message || 'Failed to fetch courses');
        }
      } catch (err) {
        console.error('Error fetching courses', err);
        setError(err.message || 'Unable to retrieve course list');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
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
        <h3>Failed to Load Courses</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Filter courses based on search term & category selection
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) || 
                          course.description.toLowerCase().includes(search.toLowerCase()) || 
                          course.instructor.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = category === 'All' || course.category === category;

    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Development', 'Design', 'Cloud Computing'];

  return (
    <div className="courses-wrapper animate-fade-in">
      {/* Search & Filter bar */}
      <div className="filter-bar glass-panel animate-slide-up">
        <div className="search-input-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search courses, instructors, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-tab-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="courses-grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course, idx) => (
            <div 
              key={course._id} 
              className="course-card glass-panel animate-slide-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
              onClick={() => navigate(`/courses/${course._id}`)}
            >
              <div className="course-card-header">
                <span className="badge badge-secondary">{course.category}</span>
                <span className="course-duration">{course.duration}</span>
              </div>

              <div className="course-card-body">
                <h3>{course.title}</h3>
                <p className="instructor-name">by {course.instructor}</p>
                <p className="course-desc">{course.description}</p>
              </div>

              <div className="course-card-footer">
                <div className="lessons-indicator">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>{course.lessonsCount} lessons</span>
                </div>
                <div className="price-tag">
                  <span className="currency">₹</span>
                  <span className="amount">{course.price}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-courses glass-panel animate-slide-up">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--text-muted))' }}>
              <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
              <path d="M12 9v4" />
              <path d="M12 16v.01" />
            </svg>
            <h3>No Courses Found</h3>
            <p>Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      <style>{`
        .courses-wrapper {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        /* Filter & Search Bar */
        .filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          gap: 20px;
          flex-wrap: wrap;
        }

        .search-input-wrapper {
          position: relative;
          flex: 1;
          min-width: 280px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: hsl(var(--text-muted));
        }

        .search-input {
          width: 100%;
          background-color: hsl(var(--bg-dark));
          border: 1px solid hsl(var(--border-color));
          color: white;
          padding: 12px 16px 12px 42px;
          font-size: 0.95rem;
          border-radius: var(--radius-sm);
          transition: var(--transition-fast);
        }

        .search-input:focus {
          outline: none;
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 3px var(--primary-glow);
        }

        .category-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .category-tab-btn {
          background-color: transparent;
          border: 1px solid hsl(var(--border-color));
          color: hsl(var(--text-secondary));
          padding: 8px 18px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .category-tab-btn:hover {
          color: white;
          background-color: hsl(var(--bg-card));
          border-color: hsl(var(--text-muted));
        }

        .category-tab-btn.active {
          background-color: hsl(var(--primary));
          color: white;
          border-color: hsl(var(--primary));
          box-shadow: 0 4px 12px var(--primary-glow);
        }

        /* Grid */
        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 30px;
        }

        .course-card {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          padding: 24px;
          min-height: 250px;
          transition: var(--transition-normal);
        }

        .course-card:hover {
          transform: translateY(-5px);
          border-color: hsl(var(--primary));
          box-shadow: 0 10px 25px var(--primary-glow);
          background-color: hsl(var(--bg-card-hover));
        }

        .course-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .course-duration {
          font-size: 0.8rem;
          font-weight: 600;
          color: hsl(var(--text-muted));
        }

        .course-card-body {
          flex: 1;
          margin-bottom: 20px;
        }

        .course-card-body h3 {
          font-size: 1.3rem;
          line-height: 1.3;
          margin-bottom: 6px;
          color: white;
        }

        .instructor-name {
          font-size: 0.85rem;
          color: hsl(var(--secondary));
          font-weight: 600;
          margin-bottom: 12px;
        }

        .course-desc {
          font-size: 0.9rem;
          color: hsl(var(--text-secondary));
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .course-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid hsl(var(--border-color) / 0.6);
          padding-top: 16px;
        }

        .lessons-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          color: hsl(var(--text-secondary));
          font-size: 0.85rem;
          font-weight: 500;
        }

        .price-tag {
          display: flex;
          align-items: baseline;
          color: white;
        }

        .price-tag .currency {
          font-size: 0.95rem;
          font-weight: 700;
          margin-right: 2px;
        }

        .price-tag .amount {
          font-family: var(--font-title);
          font-size: 1.4rem;
          font-weight: 800;
        }

        .empty-courses {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          gap: 16px;
        }

        .empty-courses p {
          color: hsl(var(--text-secondary));
        }
      `}</style>
    </div>
  );
};

export default Courses;
