import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Forgot password states
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      setSuccessMsg('Logged in successfully! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      setFormError(err.message || 'Invalid credentials');
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setFormError('Please enter your email address');
      return;
    }

    setFormError('');
    setSuccessMsg('');
    setForgotSubmitting(true);

    try {
      const res = await authAPI.forgotPassword(forgotEmail);
      if (res.success) {
        setSuccessMsg('Password reset link has been logged to console.');
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to request reset token');
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <div className="auth-split-container animate-fade-in">
      
      {/* Left Column: Brand Pitch */}
      <div className="auth-pitch-side">
        <div className="auth-pitch-header">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
            </svg>
            <span>CareerHub</span>
          </div>
        </div>

        <div className="auth-pitch-body">
          <span>Welcome to CareerHub</span>
          <h2>Your Career,<br />Our Mission</h2>
          <p>Discover opportunities, learn new skills, and build the career you've always dreamed of.</p>

          <div className="pitch-bullets">
            <div className="bullet-row">
              <div className="bullet-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <div className="bullet-text">
                <h4>Find Best Jobs</h4>
                <p>Explore top job opportunities that match your skills.</p>
              </div>
            </div>

            <div className="bullet-row">
              <div className="bullet-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div className="bullet-text">
                <h4>Learn & Grow</h4>
                <p>Access courses and certifications to boost your career.</p>
              </div>
            </div>

            <div className="bullet-row">
              <div className="bullet-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="bullet-text">
                <h4>Connect & Network</h4>
                <p>Build professional connections and grow your network.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-pitch-vector animate-float">
          <img src="/auth_illustration.png" alt="Working Illustration" onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
      </div>

      {/* Right Column: Login Card Form */}
      <div className="auth-form-side">
        <div className="auth-form-card">
          
          {/* Header Tabs */}
          <div className="auth-tabs">
            <button className="auth-tab-btn active">Login</button>
            <button className="auth-tab-btn" onClick={() => navigate('/signup')}>Sign Up</button>
          </div>

          <div className="auth-form-header">
            <h3>{isForgotMode ? 'Recover Password' : 'Welcome Back!'}</h3>
            <p>{isForgotMode ? 'Enter your email to receive recovery instructions' : 'Login to continue your journey'}</p>
          </div>

          {formError && (
            <div className="auth-alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{formError}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-alert alert-success">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <span>{successMsg}</span>
            </div>
          )}

          {!isForgotMode ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-container-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-svg">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-container-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" style={{ accentColor: 'hsl(var(--primary))' }} />
                  <span>Remember me</span>
                </label>
                <span className="forgot-link" onClick={() => { setIsForgotMode(true); setFormError(''); setSuccessMsg(''); }}>
                  Forgot?
                </span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-container-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-svg">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    disabled={forgotSubmitting}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={forgotSubmitting}>
                {forgotSubmitting ? 'Sending...' : 'Send Recovery Email'}
              </button>

              <button type="button" className="btn btn-secondary" style={{ width: '100%', padding: '12px', marginTop: '12px' }} onClick={() => { setIsForgotMode(false); setFormError(''); setSuccessMsg(''); }} disabled={forgotSubmitting}>
                Back to Login
              </button>
            </form>
          )}

          {/* Social Logins */}
          {!isForgotMode && (
            <div className="social-login-block">
              <p>or continue with</p>
              <div className="social-buttons">
                <button className="social-btn" onClick={() => {}} type="button">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="social-icon-img" />
                  Google
                </button>
                <button className="social-btn" onClick={() => {}} type="button">
                  <img src="https://www.svgrepo.com/show/475661/linkedin-color.svg" alt="LinkedIn" className="social-icon-img" />
                  LinkedIn
                </button>
                <button className="social-btn" onClick={() => {}} type="button">
                  <img src="https://www.svgrepo.com/show/448240/microsoft.svg" alt="Microsoft" className="social-icon-img" />
                  Microsoft
                </button>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                Don't have an account? <span className="forgot-link" onClick={() => navigate('/signup')}>Sign Up</span>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default Login;
