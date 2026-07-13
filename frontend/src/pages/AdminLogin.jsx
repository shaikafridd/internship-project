import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const { adminLogin, adminSetup } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      const res = isFirstTime
        ? await adminSetup(name.trim(), password)
        : await adminLogin(name.trim(), password);

      if (res && res.user && res.user.role === 'admin') {
        setSuccessMsg(
          isFirstTime
            ? 'Admin account created! Access granted...'
            : 'Admin authentication successful! Access granted...'
        );
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 800);
      } else {
        setFormError('Access Denied: You are not authorized as an Administrator.');
        setIsSubmitting(false);
      }
    } catch (err) {
      const message = err.message || 'Invalid admin credentials';

      if (message.includes('already exists')) {
        setFormError('Admin account exists. Please log in instead.');
        setIsFirstTime(false);
      } else {
        setFormError(message);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-split-container animate-fade-in" style={{ background: '#0f172a', minHeight: '100vh', display: 'flex' }}>

      <div className="auth-pitch-side" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', background: 'rgba(255,255,255,0.01)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="auth-pitch-header" style={{ marginBottom: '40px' }}>
          <div className="logo" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#2563eb' }}>
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
            </svg>
            <span style={{ fontWeight: 800 }}>CareerHub Admin</span>
          </div>
        </div>

        <div className="auth-pitch-body" style={{ color: 'white' }}>
          <span style={{ color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em' }}>Internal Admin Portal</span>
          <h2 style={{ color: 'white', fontSize: '2.2rem', fontWeight: 800, margin: '10px 0 20px', lineHeight: 1.2 }}>System Control & Analytics</h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '30px' }}>Access database settings, verify payouts, edit student profiles, update courses, and oversee platform activity.</p>

          <div className="pitch-bullets" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="bullet-row" style={{ display: 'flex', gap: '16px' }}>
              <div className="bullet-icon-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.15)', color: '#2563eb', fontSize: '1rem', flexShrink: 0 }}>
                🔑
              </div>
              <div className="bullet-text">
                <h4 style={{ color: 'white', fontWeight: 700, margin: '0 0 4px' }}>Authorized Access Only</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Session tokens are fully protected client-side.</p>
              </div>
            </div>

            <div className="bullet-row" style={{ display: 'flex', gap: '16px' }}>
              <div className="bullet-icon-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.15)', color: '#2563eb', fontSize: '1rem', flexShrink: 0 }}>
                📈
              </div>
              <div className="bullet-text">
                <h4 style={{ color: 'white', fontWeight: 700, margin: '0 0 4px' }}>Platform Activity</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Monitor real-time course completions and payment metrics.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div className="auth-form-card glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '40px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', color: 'white' }}>

          <div className="auth-form-header" style={{ marginBottom: '30px' }}>
            <h3 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px' }}>Welcome back, Admin!</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
              {isFirstTime ? 'Create your admin account' : 'Verify credentials to access admin dashboard'}
            </p>
          </div>

          {formError && (
            <div className="auth-alert alert-error" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '6px', marginBottom: '20px', display: 'flex', gap: '10px', fontSize: '0.85rem', alignItems: 'center' }}>
              ⚠️ <span>{formError}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-alert alert-success" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '6px', marginBottom: '20px', display: 'flex', gap: '10px', fontSize: '0.85rem', alignItems: 'center' }}>
              ✓ <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>Admin Name</label>
              <div className="input-container-icon" style={{ position: 'relative' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="admin-username"
                  type="text"
                  className="form-control"
                  placeholder="admin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="username"
                  disabled={isSubmitting}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '12px 12px 12px 42px', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="form-label" style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>Admin Password</label>
              <div className="input-container-icon" style={{ position: 'relative' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '12px 12px 12px 42px', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', background: '#2563eb', border: 'none', borderRadius: '6px', color: 'white', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }} disabled={isSubmitting}>
              {isSubmitting ? (isFirstTime ? 'Creating admin account...' : 'Verifying system credentials...') : (isFirstTime ? 'Create Admin Account' : 'Enter System Admin Panel')}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => { setIsFirstTime(!isFirstTime); setFormError(''); }}
              style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
            >
              {isFirstTime ? 'Already have an admin account? Log in' : 'First time? Create admin account'}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AdminLogin;