import React, { useState } from 'react';

const Settings = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [profilePublic, setProfilePublic] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="settings-wrapper animate-fade-in">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h2>Account Settings</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>Configure security, notifications, and privacy preferences.</p>
      </div>

      <div className="settings-grid">
        
        {/* Left Column: Security Settings */}
        <div className="settings-card glass-panel">
          <h3>Security & Password</h3>
          <p className="section-subtitle">Update your password to keep your account secure.</p>

          <form onSubmit={(e) => e.preventDefault()} style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-control" placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-control" placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-control" placeholder="••••••••" />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Update Password</button>
          </form>
        </div>

        {/* Right Column: Preferences */}
        <div className="settings-card glass-panel">
          <h3>Preferences</h3>
          <p className="section-subtitle">Toggle portal notification settings and privacy levels.</p>

          <div className="preferences-list" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="preference-item">
              <div className="pref-info">
                <h4>Email Notifications</h4>
                <p>Receive weekly course progress reviews and job suggestion alerts.</p>
              </div>
              <input 
                type="checkbox" 
                className="pref-toggle-checkbox"
                checked={emailAlerts}
                onChange={() => setEmailAlerts(!emailAlerts)}
              />
            </div>

            <div className="preference-item">
              <div className="pref-info">
                <h4>SMS Notification Alerts</h4>
                <p>Receive immediate alerts for interview schedules from recruiters.</p>
              </div>
              <input 
                type="checkbox" 
                className="pref-toggle-checkbox"
                checked={smsAlerts}
                onChange={() => setSmsAlerts(!smsAlerts)}
              />
            </div>

            <div className="preference-item">
              <div className="pref-info">
                <h4>Public Profile Visibility</h4>
                <p>Allow hiring recruiters to search and view your developer profile resume.</p>
              </div>
              <input 
                type="checkbox" 
                className="pref-toggle-checkbox"
                checked={profilePublic}
                onChange={() => setProfilePublic(!profilePublic)}
              />
            </div>

            <div className="preference-item">
              <div className="pref-info">
                <h4>Two-Factor Authentication</h4>
                <p>Enhance account security with Google Authenticator verification codes.</p>
              </div>
              <input 
                type="checkbox" 
                className="pref-toggle-checkbox"
                checked={twoFactor}
                onChange={() => setTwoFactor(!twoFactor)}
              />
            </div>

          </div>
        </div>

      </div>

      <style>{`
        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 24px;
          align-items: start;
        }

        .settings-card {
          padding: 24px;
        }

        .settings-card h3 {
          font-size: 1.05rem;
          margin-bottom: 4px;
        }

        .section-subtitle {
          font-size: 0.8rem;
          color: hsl(var(--text-secondary));
        }

        .preference-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid hsl(var(--border-color) / 0.5);
        }

        .preference-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .pref-info h4 {
          font-size: 0.9rem;
          margin-bottom: 2px;
        }

        .pref-info p {
          font-size: 0.75rem;
          color: hsl(var(--text-secondary));
          line-height: 1.35;
        }

        .pref-toggle-checkbox {
          width: 20px;
          height: 20px;
          accent-color: hsl(var(--primary));
          cursor: pointer;
        }

        @media (max-width: 992px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;
