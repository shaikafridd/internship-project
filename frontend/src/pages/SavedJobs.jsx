import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../services/api';

const SavedJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const res = await jobsAPI.getSavedJobs();
      if (res.success && res.data) {
        setJobs(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch saved jobs', err);
      setError('Unable to load saved jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleRemove = async (slug, e) => {
    e.stopPropagation();
    try {
      const res = await jobsAPI.toggleSaveJob(slug, {});
      if (res.success) {
        setJobs(prev => prev.filter(j => j.slug !== slug));
      }
    } catch (err) {
      console.error('Failed to remove saved job', err);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container" style={{ minHeight: '300px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="saved-jobs-wrapper animate-fade-in">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h2>Saved Jobs</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Keep track of job opportunities you are interested in.</p>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {jobs.length === 0 ? (
        <div className="empty-state glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🔖</span>
          <h3>No Saved Jobs</h3>
          <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '20px' }}>Explore the jobs board to find and bookmark opportunities.</p>
          <button className="btn btn-primary" onClick={() => navigate('/jobs')}>Explore Jobs</button>
        </div>
      ) : (
        <div className="saved-list">
          {jobs.map((job) => (
            <div key={job.slug} className="saved-item-card glass-panel" onClick={() => navigate('/jobs')}>
              <div className="item-left">
                <div className="job-avatar-letter">
                  <span>{job.company?.[0] || 'J'}</span>
                </div>
                <div className="item-meta">
                  <h3>{job.title}</h3>
                  <p className="company-details">{job.company} • 📍 {job.location}</p>
                  <div className="tags-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {job.tags?.map((tag, idx) => (
                      <span key={idx} className="badge badge-primary">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="item-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>Apply Now</button>
                  <button className="btn btn-secondary" style={{ padding: '8px', color: 'hsl(var(--accent-red))' }} onClick={(e) => handleRemove(job.slug, e)} aria-label="Remove Saved Job">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .saved-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .saved-item-card {
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: var(--transition-normal);
        }

        .saved-item-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.03);
          border-color: hsl(var(--primary));
        }

        .item-left {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .job-avatar-letter {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background-color: hsl(var(--primary) / 0.08);
          color: hsl(var(--primary));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .item-meta h3 {
          font-size: 1.05rem;
        }

        .company-details {
          font-size: 0.85rem;
          color: hsl(var(--text-secondary));
        }

        @media (max-width: 768px) {
          .saved-item-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .item-right {
            align-items: flex-start;
            width: 100%;
          }
          .item-right button {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default SavedJobs;
