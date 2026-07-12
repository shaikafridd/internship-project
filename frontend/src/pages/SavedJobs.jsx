import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SavedJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([
    { id: '1', title: 'Backend Developer (Node.js)', company: 'CodeVerse Pvt. Ltd.', location: 'Hyderabad, India', tags: ['Node.js', 'Express.js', 'MongoDB', 'REST API'], salary: '₹ 8 - 12 LPA' },
    { id: '2', title: 'Data Analyst', company: 'DataInsights', location: 'Pune, India', tags: ['SQL', 'Python', 'Power BI', 'Excel'], salary: '₹ 6 - 9 LPA' },
    { id: '3', title: 'Product Manager', company: 'InnovaTech', location: 'Bengaluru, India', tags: ['Product Strategy', 'Roadmap', 'Agile', 'JIRA'], salary: '₹ 15 - 20 LPA' }
  ]);

  const handleRemove = (id, e) => {
    e.stopPropagation();
    setJobs(jobs.filter(j => j.id !== id));
  };

  return (
    <div className="saved-jobs-wrapper animate-fade-in">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h2>Saved Jobs</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Keep track of job opportunities you are interested in.</p>
      </div>

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
            <div key={job.id} className="saved-item-card glass-panel" onClick={() => navigate('/jobs')}>
              <div className="item-left">
                <div className="job-avatar-letter">
                  <span>{job.company[0]}</span>
                </div>
                <div className="item-meta">
                  <h3>{job.title}</h3>
                  <p className="company-details">{job.company} • 📍 {job.location}</p>
                  <div className="tags-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {job.tags.map((tag, idx) => (
                      <span key={idx} className="badge badge-primary">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="item-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                <span className="salary-info" style={{ fontWeight: '700', fontSize: '0.9rem', color: 'hsl(var(--text-primary))' }}>{job.salary}</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>Apply Now</button>
                  <button className="btn btn-secondary" style={{ padding: '8px', color: 'hsl(var(--accent-red))' }} onClick={(e) => handleRemove(job.id, e)} aria-label="Remove Saved Job">🗑️</button>
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
