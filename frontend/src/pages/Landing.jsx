import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="landing-wrapper animate-fade-in">
      {/* Landing Nav */}
      <header className="landing-nav glass-panel">
        <div className="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
          </svg>
          <span>CareerHub</span>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn btn-secondary">Log In</Link>
          <Link to="/signup" className="btn btn-primary">Sign Up</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge badge badge-primary animate-float">Empowering Your Growth</span>
          <h1 className="hero-title">
            Land Your Dream Job & <br />
            <span className="gradient-text">Master New Skills</span>
          </h1>
          <p className="hero-subtitle">
            An all-in-one platform to study industry-grade courses, apply to live global job listings, optimize your resume via our smart ATS analyzer, and track your career growth progress in real time.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary btn-lg glow-btn">Get Started for Free</Link>
            <Link to="/login" className="btn btn-secondary btn-lg">Explore Dashboard</Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <h2 className="section-title">Built to Accelerate Your Career</h2>
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon p-color">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <h3>Curated Job Board</h3>
            <p>Search and apply for live job openings globally. Keep track of applied, shortlisted, or saved roles seamlessly in your dashboard.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon s-color">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <h3>Premium Learning</h3>
            <p>Enroll in comprehensive UI/UX Design, Cloud Computing, or Web Development courses. Learn section-by-section with interactive lesson checkpoints.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon a-color">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h3>ATS Resume Scanner</h3>
            <p>Upload and analyze your resume to get instant scores, key visual breakdown comparisons, and detailed optimization tips to bypass screening bots.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} CareerHub. All rights reserved.</p>
      </footer>

      <style>{`
        .landing-wrapper {
          min-height: 100vh;
          background: radial-gradient(circle at 50% 20%, rgba(138, 75, 243, 0.1) 0%, transparent 60%),
                      radial-gradient(circle at 10% 80%, rgba(0, 242, 254, 0.05) 0%, transparent 40%),
                      hsl(var(--bg-dark));
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 20px;
        }

        .landing-nav {
          width: 100%;
          max-width: 1200px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 30px;
          margin-top: 20px;
          border-radius: var(--radius-md);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          font-family: var(--font-title);
          font-weight: 800;
          font-size: 1.3rem;
        }

        .logo svg {
          color: hsl(var(--primary));
        }

        .nav-actions {
          display: flex;
          gap: 12px;
        }

        /* Hero */
        .hero {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          max-width: 900px;
          padding: 80px 0 60px;
          animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .hero-badge {
          margin-bottom: 20px;
        }

        .hero-title {
          font-size: 3.5rem;
          line-height: 1.15;
          letter-spacing: -1.5px;
          margin-bottom: 24px;
        }

        .gradient-text {
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          line-height: 1.6;
          color: hsl(var(--text-secondary));
          margin-bottom: 40px;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .btn-lg {
          padding: 16px 32px;
          font-size: 1.05rem;
          border-radius: var(--radius-md);
        }

        /* Features Section */
        .features-section {
          width: 100%;
          max-width: 1200px;
          padding: 60px 0 100px;
        }

        .section-title {
          text-align: center;
          font-size: 2.2rem;
          margin-bottom: 50px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 30px;
        }

        .feature-card {
          padding: 40px 30px;
          transition: var(--transition-normal);
        }

        .feature-card:hover {
          transform: translateY(-8px);
          border-color: hsl(var(--primary));
          box-shadow: 0 12px 30px rgba(138, 75, 243, 0.1);
        }

        .feature-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: var(--radius-sm);
          margin-bottom: 24px;
        }

        .p-color { background-color: hsl(var(--primary) / 0.15); color: hsl(var(--primary)); }
        .s-color { background-color: hsl(var(--secondary) / 0.15); color: hsl(var(--secondary)); }
        .a-color { background-color: hsl(var(--accent-green) / 0.15); color: hsl(var(--accent-green)); }

        .feature-card h3 {
          font-size: 1.3rem;
          margin-bottom: 12px;
        }

        .feature-card p {
          color: hsl(var(--text-secondary));
          line-height: 1.6;
          font-size: 0.95rem;
        }

        /* Footer */
        .landing-footer {
          width: 100%;
          border-top: 1px solid hsl(var(--border-color));
          padding: 40px 0;
          text-align: center;
          color: hsl(var(--text-muted));
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          .hero-actions {
            flex-direction: column;
            width: 100%;
            max-width: 320px;
            margin: 0 auto;
          }
          .landing-nav {
            padding: 0 16px;
          }
          .section-title {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Landing;
