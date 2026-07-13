import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { myCoursesAPI } from '../services/api';

const Certificates = () => {
  const navigate = useNavigate();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await myCoursesAPI.getMyCourses();
        if (res.success && res.data) {
          // Filter enrollments where progress is 100% or status is completed
          const completedEnrollments = res.data.filter(
            (e) => e.progress === 100 || e.status === 'completed'
          );
          
          const formattedCerts = completedEnrollments.map((e) => {
            const shortId = e.course?._id 
              ? e.course._id.substring(18).toUpperCase() 
              : Math.floor(10000 + Math.random() * 90000);
            
            const dateStr = e.updatedAt 
              ? new Date(e.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
              : 'Recently';
            
            const category = e.course?.category || 'General';
            const color = category === 'Design' ? 'hsl(var(--primary))' : 
                          category === 'Development' ? 'hsl(var(--secondary))' : 
                          'hsl(var(--accent-green))';
            const bg = category === 'Design' ? 'hsl(var(--primary) / 0.08)' : 
                       category === 'Development' ? 'hsl(var(--secondary) / 0.08)' : 
                       'hsl(var(--accent-green) / 0.08)';

            return {
              id: e._id,
              title: e.course?.title || 'Professional Course',
              date: dateStr,
              issuer: 'CareerHub Academy',
              credentialId: `CH-${category.substring(0, 2).toUpperCase()}-${shortId}`,
              color,
              bg
            };
          });

          setCerts(formattedCerts);
        }
      } catch (err) {
        console.error('Failed to load certificates', err);
        setError('Unable to load certificates.');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  if (loading) {
    return (
      <div className="spinner-container" style={{ minHeight: '300px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="certs-wrapper animate-fade-in">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h2>My Certificates</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>View, share, or download your earned professional credentials.</p>
      </div>

      {error && <p className="error-msg" style={{ color: 'hsl(var(--accent-red))', marginBottom: '16px' }}>{error}</p>}

      {certs.length === 0 ? (
        <div className="empty-state glass-panel" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
          <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '16px' }}>🏅</span>
          <h3>No Certificates Earned Yet</h3>
          <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '20px', lineHeight: 1.5 }}>
            You haven't completed any courses yet. Finish any enrolled course to 100% to view and download your verified professional certificate here.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/courses')}>Explore Courses Catalog</button>
        </div>
      ) : (
        <div className="certs-grid">
          {certs.map((cert) => (
            <div key={cert.id} className="cert-card glass-panel">
              <div className="cert-badge-logo" style={{ backgroundColor: cert.bg, color: cert.color }}>
                <span>🏅</span>
              </div>
              <div className="cert-details">
                <h3>{cert.title}</h3>
                <p className="issuer">Issued by {cert.issuer}</p>
                <div className="meta-row">
                  <span>📅 {cert.date}</span>
                  <span>ID: {cert.credentialId}</span>
                </div>
                <div className="cert-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary" style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem' }}>Download PDF</button>
                  <button className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>Share</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .certs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .cert-card {
          padding: 24px;
          display: flex;
          gap: 20px;
          align-items: flex-start;
          transition: var(--transition-normal);
        }

        .cert-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.03);
        }

        .cert-badge-logo {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
        }

        .cert-details {
          flex: 1;
        }

        .cert-details h3 {
          font-size: 1.05rem;
          margin-bottom: 4px;
        }

        .cert-details .issuer {
          font-size: 0.8rem;
          color: hsl(var(--text-secondary));
          margin-bottom: 12px;
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default Certificates;
