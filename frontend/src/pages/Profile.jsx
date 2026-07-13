import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('About');
  
  // Field values
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  
  const [updateSubmitting, setUpdateSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await profileAPI.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        
        // Pre-fill fields
        setPhone(res.data.phone || '');
        setLocation(res.data.location || '');
        setGender(res.data.gender || '');
        setAboutMe(res.data.aboutMe || 'No bio added yet. Click Edit to add a bio.');
        setSkillsStr(res.data.skills?.join(', ') || '');
        setPhotoUrl(res.data.photoUrl || '');
        
        if (res.data.dob) {
          const dateObj = new Date(res.data.dob);
          setDob(dateObj.toISOString().split('T')[0]);
        } else {
          setDob('');
        }
      } else {
        throw new Error(res.message || 'Failed to retrieve profile details');
      }
    } catch (err) {
      console.error('Error fetching profile', err);
      setError(err.message || 'Unable to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateSubmitting(true);
    setError('');
    setSuccessMsg('');

    const skills = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '');

    const profileData = {
      phone,
      location,
      gender,
      dob: dob ? new Date(dob) : undefined,
      aboutMe,
      skills,
      photoUrl,
    };

    try {
      const res = await profileAPI.updateProfile(profileData);
      if (res.success) {
        setSuccessMsg('Profile updated successfully!');
        setIsEditing(false);
        fetchProfile();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setUpdateSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="error-container glass-panel animate-fade-in">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--accent-red))' }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3>Failed to Load Profile</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const { name, email, achievements, activityLog, stats, skills, atsTopMatch, atsFeedback, education, experience } = profile;

  return (
    <div className="profile-wrapper animate-fade-in">
      {successMsg && (
        <div className="notification-banner notification-success">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid split */}
      <div className="profile-grid">
        
        {/* Left Column: Info card & Bio sub-panel (matches Image 2) */}
        <div className="profile-summary-column">
          
          <div className="profile-header-card glass-panel">
            <div className="header-flex-row">
              <div className="avatar-uploader-circle">
                {photoUrl ? (
                  <img 
                    src={photoUrl} 
                    alt={name} 
                    className="profile-avatar"
                  />
                ) : (
                  <div 
                    className="profile-avatar-initials"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      backgroundColor: 'hsl(var(--primary) / 0.1)',
                      color: 'hsl(var(--primary))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem',
                      fontWeight: 800,
                      border: '1px solid hsl(var(--border-color))'
                    }}
                  >
                    {name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                )}
                <button className="cam-btn" aria-label="Upload Photo">📷</button>
              </div>

              <div className="header-meta-details">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h2>{name}</h2>
                  <button className="btn-edit-inline" onClick={() => setIsEditing(true)}>Edit</button>
                </div>
                <p className="role">{atsTopMatch?.role || 'Job Seeker'}</p>
                <div className="details-list-vertical">
                  <span className="detail-item">
                    📍 {location || 'No location set'}
                  </span>
                  <span className="detail-item">
                    ✉️ {email}
                  </span>
                  <span className="detail-item">
                    📞 {phone || '+91 98765 43210'}
                  </span>
                  <span className="detail-item muted">
                    📅 Joined on Jan 15, 2024
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-tabs row inside left pane */}
            <div className="profile-sub-tabs">
              {['About', 'Education', 'Experience', 'Skills', 'Resume', 'Settings'].map((tab) => (
                <button
                  key={tab}
                  className={`sub-tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab === 'Settings') setIsEditing(true);
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Form settings edit pane */}
          {isEditing ? (
            <div className="edit-form-panel glass-panel animate-slide-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '12px' }}>
                <h3 style={{ margin: 0 }}>Edit Profile settings</h3>
                <button className="btn-edit-inline" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>

              <form onSubmit={handleUpdateSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="text" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input type="text" className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-control" value={gender} onChange={(e) => setGender(e.target.value)}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-control" value={dob} onChange={(e) => setDob(e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Skills (comma separated)</label>
                  <input type="text" className="form-control" value={skillsStr} onChange={(e) => setSkillsStr(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">About Me (Bio)</label>
                  <textarea className="form-control" rows="3" value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={updateSubmitting}>
                  {updateSubmitting ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            </div>
          ) : (
            <div className="profile-about-blocks-container animate-slide-up">
              {activeTab === 'About' && (
                <>
                  {/* About Me block */}
                  <div className="info-block-card glass-panel">
                    <div className="title-row">
                      <h3>About Me</h3>
                      <button className="btn-edit-inline" onClick={() => setIsEditing(true)}>Edit</button>
                    </div>
                    <p className="bio-text">{aboutMe}</p>
                  </div>

                  {/* Personal Information */}
                  <div className="info-block-card glass-panel" style={{ marginTop: '24px' }}>
                    <div className="title-row">
                      <h3>Personal Information</h3>
                      <button className="btn-edit-inline" onClick={() => setIsEditing(true)}>Edit</button>
                    </div>

                    <div className="personal-info-grid">
                      <div className="info-item">
                        <span>Full Name</span>
                        <p>{name}</p>
                      </div>
                      <div className="info-item">
                        <span>Date of Birth</span>
                        <p>{dob ? new Date(dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '15 May 2002'}</p>
                      </div>
                      <div className="info-item">
                        <span>Gender</span>
                        <p>{gender || 'Male'}</p>
                      </div>
                      <div className="info-item">
                        <span>Location</span>
                        <p>{location || 'Hyderabad, India'}</p>
                      </div>
                      <div className="info-item">
                        <span>Phone</span>
                        <p>{phone || '+91 98765 43210'}</p>
                      </div>
                      <div className="info-item">
                        <span>Email</span>
                        <p>{email}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'Education' && (
                <div className="info-block-card glass-panel animate-fade-in">
                  <div className="title-row">
                    <h3>Education History</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/ats-analyzer')}>
                      Scan Resume
                    </button>
                  </div>
                  
                  <div className="timeline-list-block">
                    {education && education.length > 0 ? (
                      education.map((edu, idx) => (
                        <div key={edu._id || idx} className="timeline-card-item" style={{ marginTop: idx > 0 ? '20px' : '0px' }}>
                          <div className="badge-marker">🎓</div>
                          <div className="timeline-card-details">
                            <h4>{edu.degree}</h4>
                            <p className="sub">{edu.school} • {edu.year}</p>
                            {edu.grade && <span className="grade-badge">{edu.grade}</span>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-placeholder" style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>🎓</span>
                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>No education history parsed yet.</p>
                        <span style={{ fontSize: '0.75rem', display: 'block', marginTop: '6px', lineHeight: 1.4 }}>
                          Upload your resume in the <strong style={{ color: 'hsl(var(--primary))', cursor: 'pointer' }} onClick={() => navigate('/ats-analyzer')}>ATS Optimizer</strong> to automatically extract and save your education details.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'Experience' && (
                <div className="info-block-card glass-panel animate-fade-in">
                  <div className="title-row">
                    <h3>Work Experience</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/ats-analyzer')}>
                      Scan Resume
                    </button>
                  </div>

                  <div className="timeline-list-block">
                    {experience && experience.length > 0 ? (
                      experience.map((exp, idx) => (
                        <div key={exp._id || idx} className="timeline-card-item" style={{ marginTop: idx > 0 ? '20px' : '0px' }}>
                          <div className="badge-marker">💼</div>
                          <div className="timeline-card-details">
                            <h4>{exp.role}</h4>
                            <p className="sub">{exp.company} • {exp.duration}</p>
                            {exp.description && (
                              <p className="desc-text" style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginTop: '6px', lineHeight: '1.4' }}>
                                {exp.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-placeholder" style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>💼</span>
                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>No work experience parsed yet.</p>
                        <span style={{ fontSize: '0.75rem', display: 'block', marginTop: '6px', lineHeight: 1.4 }}>
                          Upload your resume in the <strong style={{ color: 'hsl(var(--primary))', cursor: 'pointer' }} onClick={() => navigate('/ats-analyzer')}>ATS Optimizer</strong> to automatically extract and save your work history.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'Skills' && (
                <div className="info-block-card glass-panel">
                  <div className="title-row">
                    <h3>Detailed Skills Matrix</h3>
                    <button className="btn-edit-inline" onClick={() => setIsEditing(true)}>Edit</button>
                  </div>

                  <div className="skills-bars-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      { name: 'HTML & CSS', value: 95 },
                      { name: 'JavaScript', value: 90 },
                      { name: 'React JS', value: 85 },
                      { name: 'Node.js & Express', value: 75 },
                      { name: 'Tailwind CSS & Git', value: 80 },
                      { name: 'Figma UI Design', value: 85 }
                    ].map((s, idx) => (
                      <div key={idx} className="skill-progress-row">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                          <span>{s.name}</span>
                          <span>{s.value}%</span>
                        </div>
                        <div className="progress-container" style={{ height: '8px', background: '#f1f5f9' }}>
                          <div className="progress-bar" style={{ width: `${s.value}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Resume' && (
                <div className="info-block-card glass-panel animate-fade-in">
                  <div className="title-row">
                    <h3>ATS Resume Optimization</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/ats-analyzer')}>
                      Scan New Resume
                    </button>
                  </div>

                  <div className="resume-details-box" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
                    {/* Resume File Info */}
                    <div className="resume-file-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid hsl(var(--border-color))' }}>
                      <span style={{ fontSize: '2rem' }}>📄</span>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '0.9rem' }}>My_Scanned_Resume.pdf</h4>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>
                          {atsTopMatch?.role ? 'Scanned successfully via ATS Optimizer' : 'Not yet scanned'}
                        </span>
                      </div>
                      <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => navigate('/ats-analyzer')}>
                        Open Scanner
                      </button>
                    </div>

                    {atsTopMatch?.role ? (
                      <>
                        {/* ATS Stats Summary Grid */}
                        <div className="ats-profile-summary-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginTop: '10px' }}>
                          {/* Left: Score Visualizer */}
                          <div className="ats-score-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'linear-gradient(135deg, hsl(var(--primary) / 0.03) 0%, transparent 100%)', border: '1px solid hsl(var(--border-color))', borderRadius: '12px', textAlign: 'center' }}>
                            <div className="ats-score-circle" style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                              <svg className="svg-circle" width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border-color))" strokeWidth="6" />
                                <circle 
                                  cx="50" cy="50" r="42" 
                                  fill="none" 
                                  stroke={atsTopMatch.score >= 70 ? 'hsl(var(--accent-green))' : atsTopMatch.score >= 40 ? 'hsl(var(--accent-yellow))' : 'hsl(var(--accent-red))'} 
                                  strokeWidth="6" 
                                  strokeLinecap="round"
                                  style={{
                                    strokeDasharray: '263.89',
                                    strokeDashoffset: (263.89 - (263.89 * atsTopMatch.score) / 100).toString()
                                  }}
                                />
                              </svg>
                              <div style={{ position: 'absolute', fontFamily: 'var(--font-title)', fontSize: '1.4rem', fontWeight: 800 }}>
                                {atsTopMatch.score}%
                              </div>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ATS Score</span>
                          </div>

                          {/* Right: Top Match Details */}
                          <div className="ats-role-details" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
                            <span className="badge" style={{ alignSelf: 'flex-start', backgroundColor: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', padding: '4px 8px' }}>Top Career Track</span>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{atsTopMatch.role}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.4 }}>
                              Your resume matches this role best. Check out your customized recommended job matches in the job portal!
                            </p>
                          </div>
                        </div>

                        {/* LLM Feedback Summary */}
                        {atsFeedback && (
                          <div className="ats-profile-feedback-box" style={{ marginTop: '10px', padding: '20px', backgroundColor: 'hsl(var(--bg-dark))', border: '1px solid hsl(var(--border-color))', borderRadius: '12px' }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>💡</span> Latest Optimizer Feedback
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {atsFeedback.split('\n\n').slice(0, 2).map((para, pIdx) => {
                                const parts = para.split(': ');
                                return (
                                  <p key={pIdx} style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.5 }}>
                                    {parts.length >= 2 ? (
                                      <>
                                        <strong>{parts[0]}: </strong>
                                        {parts.slice(1).join(': ')}
                                      </>
                                    ) : para}
                                  </p>
                                );
                              })}
                              {atsFeedback.split('\n\n').length > 2 && (
                                <span 
                                  onClick={() => navigate('/ats-analyzer')} 
                                  style={{ color: 'hsl(var(--primary))', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start', marginTop: '4px' }}
                                >
                                  Read full suggestions &rarr;
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="resume-upload-dropzone" onClick={() => navigate('/ats-analyzer')} style={{ marginTop: '10px', border: '2px dashed hsl(var(--border-color))', borderRadius: '8px', padding: '40px 20px', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>⚡</span>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>Optimize Your Resume for ATS</p>
                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', lineHeight: 1.4, display: 'block', marginTop: '6px' }}>
                          Upload your PDF resume to parse skills, check career compatibility scores, and unlock personalized recommended jobs.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Metrics, Skills, Timelines (matches Image 2) */}
        <div className="profile-details-column">
          
          {/* Mini Stats row */}
          <div className="mini-stats-grid">
            <div className="mini-stat-box glass-panel">
              <span className="icon">📖</span>
              <div className="stat-content">
                <strong>{stats?.coursesEnrolled || 12}</strong>
                <span>Courses Enrolled</span>
              </div>
            </div>

            <div className="mini-stat-box glass-panel">
              <span className="icon">🎖️</span>
              <div className="stat-content">
                <strong>{stats?.certificatesEarned || 5}</strong>
                <span>Certificates Earned</span>
              </div>
            </div>

            <div className="mini-stat-box glass-panel">
              <span className="icon">💼</span>
              <div className="stat-content">
                <strong>{stats?.applicationsSubmitted || 8}</strong>
                <span>Applications Submitted</span>
              </div>
            </div>

            <div className="mini-stat-box glass-panel">
              <span className="icon">🔖</span>
              <div className="stat-content">
                <strong>{stats?.jobsSaved || 3}</strong>
                <span>Jobs Saved</span>
              </div>
            </div>
          </div>

          {/* Top Skills */}
          <div className="details-card-block glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3>Top Skills</h3>
              <span className="view-all-link">View all</span>
            </div>
            <div className="skills-tags-row">
              {skills && skills.length > 0 ? (
                skills.map((skill, idx) => (
                  <span key={idx} className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>{skill}</span>
                ))
              ) : (
                ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Tailwind CSS', 'Git & GitHub', 'Figma'].map((skill, idx) => (
                  <span key={idx} className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>{skill}</span>
                ))
              )}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="details-card-block glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3>Recent Achievements</h3>
            </div>

            <div className="profile-timeline-list">
              {achievements && achievements.length > 0 ? (
                achievements.map((ach, idx) => (
                  <div key={idx} className="timeline-row-item">
                    <div className="icon-badge-box bg-green">🟢</div>
                    <div className="row-content">
                      <p className="title">{ach.title}</p>
                      <span className="date-label">
                        {new Date(ach.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '16px', fontSize: '0.8rem', color: 'hsl(var(--text-muted))', textAlign: 'center' }}>
                  No achievements recorded yet. Complete course modules or scan resumes to unlock milestones.
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="details-card-block glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3>Recent Activity</h3>
            </div>

            <div className="profile-timeline-list">
              {activityLog && activityLog.length > 0 ? (
                activityLog.map((log, idx) => (
                  <div key={idx} className="timeline-row-item">
                    <div className="icon-badge-box bg-blue">📝</div>
                    <div className="row-content">
                      <p className="title">{log.text}</p>
                      <span className="date-label">
                        {new Date(log.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '16px', fontSize: '0.8rem', color: 'hsl(var(--text-muted))', textAlign: 'center' }}>
                  No recent activities recorded.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      <style>{`
        .profile-wrapper {
          display: flex;
          flex-direction: column;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 24px;
          align-items: start;
        }

        .profile-summary-column, .profile-details-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .profile-header-card {
          padding: 24px;
        }

        .header-flex-row {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .avatar-uploader-circle {
          position: relative;
        }

        .profile-avatar {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid hsl(var(--border-color));
        }

        .cam-btn {
          position: absolute;
          bottom: 0; right: 0;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid hsl(var(--border-color));
          background: white;
          font-size: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-meta-details h2 {
          font-size: 1.4rem;
          font-weight: 800;
        }

        .btn-edit-inline {
          background: transparent;
          border: 1px solid hsl(var(--border-color));
          color: hsl(var(--text-secondary));
          font-size: 0.75rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-edit-inline:hover {
          background-color: hsl(var(--bg-dark));
        }

        .header-meta-details .role {
          font-size: 0.85rem;
          color: hsl(var(--text-secondary));
          font-weight: 600;
          margin: 2px 0 10px;
        }

        .details-list-vertical {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-item {
          font-size: 0.8rem;
          color: hsl(var(--text-secondary));
          font-weight: 500;
        }

        .detail-item.muted {
          color: hsl(var(--text-muted));
        }

        /* Tabs on left summary card */
        .profile-sub-tabs {
          display: flex;
          gap: 12px;
          border-top: 1px solid hsl(var(--border-color));
          padding-top: 16px;
        }

        .sub-tab-btn {
          background: transparent;
          border: none;
          padding: 8px 12px;
          font-size: 0.85rem;
          font-weight: 600;
          color: hsl(var(--text-secondary));
          cursor: pointer;
          border-bottom: 2px solid transparent;
        }

        .sub-tab-btn.active {
          color: hsl(var(--primary));
          border-bottom-color: hsl(var(--primary));
        }

        /* Info blocks Left */
        .info-block-card {
          padding: 24px;
        }

        .info-block-card h3 {
          font-size: 1.05rem;
        }

        .title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          border-bottom: 1px solid hsl(var(--border-color));
          padding-bottom: 10px;
        }

        .bio-text {
          font-size: 0.85rem;
          color: hsl(var(--text-secondary));
          line-height: 1.5;
        }

        .personal-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px 24px;
        }

        .info-item span {
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
          font-weight: 600;
          display: block;
          margin-bottom: 2px;
        }

        .info-item p {
          font-size: 0.85rem;
          color: hsl(var(--text-primary));
          font-weight: 600;
        }

        /* Right Column Mini stats */
        .mini-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .mini-stat-box {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
        }

        .mini-stat-box .icon {
          font-size: 1.4rem;
        }

        .mini-stat-box .stat-content {
          display: flex;
          flex-direction: column;
        }

        .mini-stat-box .stat-content strong {
          font-family: var(--font-title);
          font-size: 1.25rem;
          font-weight: 800;
          line-height: 1.1;
        }

        .mini-stat-box .stat-content span {
          font-size: 0.75rem;
          color: hsl(var(--text-secondary));
          font-weight: 600;
        }

        .details-card-block {
          padding: 24px;
        }

        .details-card-block h3 {
          font-size: 1.05rem;
        }

        .skills-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        /* Timeline lists right */
        .profile-timeline-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .timeline-row-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-bottom: 12px;
          border-bottom: 1px solid hsl(var(--border-color) / 0.4);
        }

        .timeline-row-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .icon-badge-box {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }

        .bg-green { background-color: rgba(16, 185, 129, 0.08); }
        .bg-blue { background-color: rgba(37, 99, 235, 0.08); }

        .row-content .title {
          font-size: 0.85rem;
          font-weight: 600;
          color: hsl(var(--text-primary));
        }

        .row-content .date-label {
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
          font-weight: 500;
        }

        .timeline-list-block {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .timeline-card-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .badge-marker {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
          border: 1px solid hsl(var(--border-color));
        }

        .timeline-card-details h4 {
          font-size: 0.95rem;
          margin-bottom: 2px;
        }

        .timeline-card-details .sub {
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
          font-weight: 600;
          margin-bottom: 6px;
        }

        .grade-badge {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          color: hsl(var(--primary));
          background-color: hsl(var(--primary) / 0.08);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .skill-progress-row {
          width: 100%;
        }

        @media (max-width: 992px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
          .personal-info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
