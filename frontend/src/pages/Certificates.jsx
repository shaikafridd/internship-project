import React from 'react';

const Certificates = () => {
  const certs = [
    { id: '1', title: 'Python for Beginners', date: 'May 10, 2024', issuer: 'CareerHub Academy', credentialId: 'CH-PY-98271', color: 'hsl(var(--accent-green))', bg: 'hsl(var(--accent-green) / 0.08)' },
    { id: '2', title: 'UI/UX Design Basics', date: 'Apr 20, 2024', issuer: 'CareerHub Academy', credentialId: 'CH-UI-54129', color: 'hsl(var(--primary))', bg: 'hsl(var(--primary) / 0.08)' },
    { id: '3', title: 'React JS Basics', date: 'Mar 05, 2024', issuer: 'CareerHub Academy', credentialId: 'CH-RE-76510', color: 'hsl(var(--secondary))', bg: 'hsl(var(--secondary) / 0.08)' }
  ];

  return (
    <div className="certs-wrapper animate-fade-in">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h2>My Certificates</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>View, share, or download your earned professional credentials.</p>
      </div>

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
