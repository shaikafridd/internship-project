import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Jobs = () => {
  const { user } = useAuth();
  // Tabs: 'search' or 'saved' or 'applied'
  const [activeTab, setActiveTab] = useState('search');

  // Jobs States
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  // Loaders
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  // Filters
  const [search, setSearch] = useState(urlSearch);
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  // Wizard States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [resumeName, setResumeName] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('Immediate');
  const [expectedSalary, setExpectedSalary] = useState('10 LPA');
  const [wizardSubmitting, setWizardSubmitting] = useState(false);
  const [wizardError, setWizardError] = useState('');
  const [wizardSuccess, setWizardSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      const sanitizedName = user.name ? user.name.replace(/\s+/g, '_') : 'User';
      setResumeName(`${sanitizedName}_Resume.pdf`);
      setCoverLetter(`Dear Hiring Team,\n\nI am highly motivated to join your engineering team as a ${user.atsTopMatch?.role || 'Developer'}. I have skills in ${(user.skills && user.skills.length > 0) ? user.skills.slice(0, 4).join(', ') : 'software development'}.\n\nBest regards,\n${user.name || 'Applicant'}`);
    }
  }, [user]);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'search') {
        const queryTerm = urlSearch || search;
        const res = await jobsAPI.getJobs(queryTerm, location, jobType, false);
        if (res.success && res.data) {
          setJobs(res.data);
          if (res.data.length > 0 && !selectedJob) {
            setSelectedJob(res.data[0]);
          }
        }
      } else if (activeTab === 'recommend') {
        const res = await jobsAPI.getJobs('', '', '', true);
        if (res.success && res.data) {
          setJobs(res.data);
          if (res.data.length > 0 && !selectedJob) {
            setSelectedJob(res.data[0]);
          }
        }
      } else if (activeTab === 'saved') {
        const res = await jobsAPI.getSavedJobs();
        if (res.success && res.data) {
          setSavedJobs(res.data);
          if (res.data.length > 0 && !selectedJob) {
            setSelectedJob(res.data[0]);
          }
        }
      } else if (activeTab === 'applied') {
        const res = await jobsAPI.getApplications();
        if (res.success && res.data) {
          setAppliedJobs(res.data);
          if (res.data.length > 0 && !selectedJob) {
            setSelectedJob(res.data[0]);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching jobs', err);
      setError(err.message || 'Failed to retrieve job listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedJob(null);
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, urlSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(prev => {
      if (search) {
        prev.set('search', search);
      } else {
        prev.delete('search');
      }
      return prev;
    });
  };

  const handleToggleSave = async (job, e) => {
    e.stopPropagation();
    try {
      const details = {
        title: job.title,
        company: job.company || job.company_name,
        location: job.location,
        tags: job.tags || [],
      };
      const res = await jobsAPI.toggleSaveJob(job.slug, details);
      if (res.success) {
        // Toggle saved key locally
        if (activeTab === 'search' || activeTab === 'recommend') {
          setJobs(prev => prev.map(j => j.slug === job.slug ? { ...j, isSaved: res.isSaved } : j));
        }
        if (selectedJob && selectedJob.slug === job.slug) {
          setSelectedJob(prev => ({ ...prev, isSaved: res.isSaved }));
        }
        // If on saved tab, refresh saved list
        if (activeTab === 'saved') {
          fetchJobs();
        }
      }
    } catch (err) {
      console.error('Error saving job', err);
      alert(err.message || 'Failed to save job');
    }
  };

  // Wizard Submissions
  const handleOpenWizard = () => {
    if (!selectedJob) return;
    setWizardStep(1);
    setWizardError('');
    setWizardSuccess(false);
    setIsWizardOpen(true);
  };

  const handleNextStep = () => {
    setWizardStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setWizardStep(prev => prev - 1);
  };

  const handleWizardSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;
    setWizardSubmitting(true);
    setWizardError('');

    const appData = {
      jobSlug: selectedJob.slug,
      title: selectedJob.title,
      company: selectedJob.company || selectedJob.company_name,
      salaryRange: selectedJob.salary || '₹ 6 - 10 LPA',
      resumeUrl: resumeName,
      coverLetterUrl: coverLetter,
      additionalAnswers: {
        noticePeriod,
        expectedSalary,
      }
    };

    try {
      const res = await jobsAPI.applyJob(appData);
      if (res.success) {
        setWizardSuccess(true);
      }
    } catch (err) {
      setWizardError(err.message || 'Application failed to submit.');
    } finally {
      setWizardSubmitting(false);
    }
  };

  const checkIsApplied = (_slug) => {
    // If we've applied during this session or fetched
    if (activeTab === 'applied') return true;
    return false;
  };

  return (
    <div className="jobs-wrapper animate-fade-in">
      {/* Tabs */}
      <div className="jobs-tabs">
        <button className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
          Search Jobs
        </button>
        <button className={`tab-btn ${activeTab === 'recommend' ? 'active' : ''}`} onClick={() => setActiveTab('recommend')}>
          Recommended Jobs
        </button>
        <button className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
          Saved Jobs
        </button>
        <button className={`tab-btn ${activeTab === 'applied' ? 'active' : ''}`} onClick={() => setActiveTab('applied')}>
          My Applications
        </button>
      </div>

      {/* Filter panel (only for Search tab) */}
      {activeTab === 'search' && (
        <form className="jobs-filter-panel glass-panel animate-slide-up" onSubmit={handleSearchSubmit}>
          <div className="filter-input-row">
            <div className="filter-input-group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Job title, keywords, skill..." 
                className="form-control" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>

            <div className="filter-input-group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle>
              </svg>
              <input 
                type="text" 
                placeholder="Location (e.g. Berlin, Germany)" 
                className="form-control" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
              />
            </div>

            <div className="filter-input-group select-group">
              <select className="form-control" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                <option value="">All Job Types</option>
                <option value="remote">Remote Only</option>
                <option value="full-time">Full-time Onsite</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary search-btn">
              Search
            </button>
          </div>
        </form>
      )}

      {/* Dual Pane Layout */}
      <div className="jobs-pane-grid">
        
        {/* Left Pane: Job List */}
        <div className="job-list-pane">
          {loading ? (
            <div className="spinner-container" style={{ minHeight: '150px' }}>
              <div className="spinner"></div>
            </div>
          ) : error ? (
            <p className="error-msg">{error}</p>
          ) : (
            <div className="jobs-list">
              {(activeTab === 'search' || activeTab === 'recommend') && jobs.length > 0 ? (
                jobs.map((job) => (
                  <div 
                    key={job.slug} 
                    className={`job-item-card glass-panel ${selectedJob?.slug === job.slug ? 'active' : ''}`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="card-header-row">
                      <h4>{job.title}</h4>
                      <button className={`save-ribbon ${job.isSaved ? 'saved' : ''}`} onClick={(e) => handleToggleSave(job, e)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={job.isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    </div>
                    <p className="company">{job.company}</p>
                    <div className="meta-badges">
                      <span className="badge badge-primary">{job.jobType}</span>
                      <span className="location-badge">{job.location}</span>
                      {activeTab === 'recommend' && typeof job.matchScore === 'number' && (
                        <span 
                          className="badge match-score-badge"
                          style={{
                            backgroundColor: job.matchScore >= 70 ? 'hsl(var(--accent-green) / 0.1)' : job.matchScore >= 40 ? 'hsl(var(--accent-yellow) / 0.1)' : 'hsl(var(--accent-red) / 0.1)',
                            color: job.matchScore >= 70 ? 'hsl(var(--accent-green))' : job.matchScore >= 40 ? 'hsl(var(--accent-yellow))' : 'hsl(var(--accent-red))',
                            fontWeight: 700,
                            border: '1px solid hsl(var(--border-color))'
                          }}
                        >
                          {job.matchScore}% Match
                        </span>
                      )}
                    </div>
                    <div className="tags-row">
                      {job.tags?.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="tag-badge">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))
              ) : activeTab === 'saved' && savedJobs.length > 0 ? (
                savedJobs.map((job) => (
                  <div 
                    key={job.slug} 
                    className={`job-item-card glass-panel ${selectedJob?.slug === job.slug ? 'active' : ''}`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="card-header-row">
                      <h4>{job.title}</h4>
                      <button className="save-ribbon saved" onClick={(e) => handleToggleSave(job, e)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    </div>
                    <p className="company">{job.company}</p>
                    <div className="meta-badges">
                      <span className="location-badge">{job.location}</span>
                    </div>
                  </div>
                ))
              ) : activeTab === 'applied' && appliedJobs.length > 0 ? (
                appliedJobs.map((app) => (
                  <div 
                    key={app.jobSlug} 
                    className={`job-item-card glass-panel ${selectedJob?.slug === app.jobSlug ? 'active' : ''}`}
                    onClick={() => setSelectedJob({ ...app, slug: app.jobSlug })}
                  >
                    <div className="card-header-row">
                      <h4>{app.title}</h4>
                      <span className={`badge ${
                        app.status === 'Shortlisted' ? 'badge-success' : 
                        app.status === 'Applied' ? 'badge-primary' : 
                        app.status === 'Under Review' ? 'badge-warning' : 
                        'badge-danger'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="company">{app.company}</p>
                    <p className="salary" style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginTop: '6px' }}>
                      Applied with: {app.resumeUrl}
                    </p>
                  </div>
                ))
              ) : (
                <p className="empty-text">No jobs found in this category.</p>
              )}
            </div>
          )}
        </div>

        {/* Right Pane: Selected Job Details */}
        <div className="job-details-pane glass-panel">
          {selectedJob ? (
            <div className="details-container animate-fade-in">
              <div className="details-header-block">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h2>{selectedJob.title}</h2>
                    <p className="company-link">{selectedJob.company || selectedJob.company_name}</p>
                  </div>
                  
                  {activeTab !== 'applied' && (
                    <button 
                      className={`btn btn-primary apply-now-btn ${checkIsApplied(selectedJob.slug) ? 'disabled' : ''}`}
                      disabled={checkIsApplied(selectedJob.slug)}
                      onClick={handleOpenWizard}
                    >
                      {checkIsApplied(selectedJob.slug) ? 'Applied' : 'Apply Now'}
                    </button>
                  )}
                </div>

                <div className="details-meta-stats">
                  <div className="meta-box">
                    <span>Location</span>
                    <strong>{selectedJob.location}</strong>
                  </div>
                  <div className="meta-box">
                    <span>Estimated Salary</span>
                    <strong>{selectedJob.salary || '₹ 6 - 10 LPA'}</strong>
                  </div>
                  <div className="meta-box">
                    <span>Job Type</span>
                    <strong>{selectedJob.jobType || 'Full-time'}</strong>
                  </div>
                </div>

                {selectedJob.tags && (
                  <div className="tags-block">
                    {selectedJob.tags.map((tag, idx) => (
                      <span key={idx} className="tag-badge">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="details-desc-block">
                <h3>Job Description</h3>
                {selectedJob.description ? (
                  <div 
                    className="html-description"
                    dangerouslySetInnerHTML={{ __html: selectedJob.description }}
                  />
                ) : (
                  <p>No description provided for this job opening. Please check the website portal links.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-details">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--text-muted))' }}>
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              <p>Select a job from the list to view full details.</p>
            </div>
          )}
        </div>

      </div>

      {/* Application Wizard Modal */}
      {isWizardOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content glass-panel animate-slide-up">
            <div className="modal-header">
              <h3>Apply for {selectedJob?.title}</h3>
              <button className="close-btn" onClick={() => setIsWizardOpen(false)} disabled={wizardSubmitting}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {wizardSuccess ? (
              <div className="wizard-success-panel animate-fade-in">
                <div className="success-icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h3>Application Submitted!</h3>
                <p>Your job application for <strong>{selectedJob?.title}</strong> at <strong>{selectedJob?.company || selectedJob?.company_name}</strong> was submitted successfully. You can track its review progress in the 'My Applications' tab.</p>
                <button className="btn btn-primary" onClick={() => { setIsWizardOpen(false); setActiveTab('applied'); }}>
                  Track Application
                </button>
              </div>
            ) : (
              <form onSubmit={handleWizardSubmit}>
                {/* Steps Indicator */}
                <div className="steps-indicator">
                  <span className={`step-dot ${wizardStep >= 1 ? 'active' : ''}`}>1. Profile Details</span>
                  <span className={`step-line ${wizardStep >= 2 ? 'active' : ''}`}></span>
                  <span className={`step-dot ${wizardStep >= 2 ? 'active' : ''}`}>2. Documents</span>
                  <span className={`step-line ${wizardStep >= 3 ? 'active' : ''}`}></span>
                  <span className={`step-dot ${wizardStep >= 3 ? 'active' : ''}`}>3. Questions</span>
                </div>

                {wizardError && <p className="wizard-error-msg">{wizardError}</p>}

                {/* Step 1: Profile verification */}
                {wizardStep === 1 && (
                  <div className="wizard-step animate-fade-in">
                    <p className="step-intro">Please confirm your contact details before submitting this application.</p>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-control" value={user?.name || ''} readOnly />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input type="email" className="form-control" value={user?.email || ''} readOnly />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input type="text" className="form-control" value={user?.phone || 'No phone number added'} readOnly />
                    </div>
                  </div>
                )}

                {/* Step 2: Uploads */}
                {wizardStep === 2 && (
                  <div className="wizard-step animate-fade-in">
                    <p className="step-intro">Upload your latest professional resume and cover letter.</p>
                    <div className="form-group">
                      <label className="form-label">Resume Filename</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={resumeName} 
                        onChange={(e) => setResumeName(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cover Letter</label>
                      <textarea 
                        className="form-control" 
                        rows="4" 
                        value={coverLetter} 
                        onChange={(e) => setCoverLetter(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Screening questions */}
                {wizardStep === 3 && (
                  <div className="wizard-step animate-fade-in">
                    <p className="step-intro">Answer these brief screening questions to complete your application.</p>
                    <div className="form-group">
                      <label className="form-label">Notice Period</label>
                      <select className="form-control" value={noticePeriod} onChange={(e) => setNoticePeriod(e.target.value)}>
                        <option value="Immediate">Immediate / 15 Days</option>
                        <option value="30 Days">30 Days</option>
                        <option value="60 Days">60 Days</option>
                        <option value="90 Days">90 Days</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Expected Salary Package (LPA)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={expectedSalary} 
                        onChange={(e) => setExpectedSalary(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                )}

                {/* Footer buttons */}
                <div className="modal-footer">
                  {wizardStep > 1 && (
                    <button type="button" className="btn btn-secondary" onClick={handlePrevStep} disabled={wizardSubmitting}>
                      Back
                    </button>
                  )}
                  
                  {wizardStep < 3 ? (
                    <button type="button" className="btn btn-primary" onClick={handleNextStep} style={{ marginLeft: 'auto' }}>
                      Continue
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-primary glow-btn" style={{ marginLeft: 'auto' }} disabled={wizardSubmitting}>
                      {wizardSubmitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        .jobs-wrapper {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        /* Tabs */
        .jobs-tabs {
          display: flex;
          gap: 12px;
          border-bottom: 1px solid hsl(var(--border-color));
          padding-bottom: 1px;
        }

        .tab-btn {
          background-color: transparent;
          border: none;
          color: hsl(var(--text-secondary));
          padding: 12px 24px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
          border-bottom: 2px solid transparent;
        }

        .tab-btn:hover {
          color: white;
        }

        .tab-btn.active {
          color: hsl(var(--primary));
          border-bottom-color: hsl(var(--primary));
        }

        /* Filter Panel */
        .jobs-filter-panel {
          padding: 20px;
        }

        .filter-input-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .filter-input-group {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .filter-input-group .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: hsl(var(--text-muted));
        }

        .filter-input-group .form-control {
          padding-left: 42px;
        }

        .select-group select {
          cursor: pointer;
        }

        /* Dual Pane Grid */
        .jobs-pane-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 30px;
          align-items: start;
        }

        .job-list-pane {
          display: flex;
          flex-direction: column;
          max-height: calc(100vh - var(--navbar-height) - 150px);
          overflow-y: auto;
          gap: 16px;
        }

        .jobs-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .job-item-card {
          padding: 20px;
          cursor: pointer;
          transition: var(--transition-normal);
          border: 1px solid hsl(var(--border-color));
        }

        .job-item-card:hover {
          border-color: hsl(var(--text-muted));
          background-color: hsl(var(--bg-card));
        }

        .job-item-card.active {
          border-color: hsl(var(--primary));
          background: linear-gradient(135deg, hsl(var(--bg-card)), hsl(var(--primary) / 0.05));
        }

        .card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 12px;
          margin-bottom: 6px;
        }

        .card-header-row h4 {
          font-size: 1.05rem;
          color: white;
        }

        .save-ribbon {
          background: transparent;
          border: none;
          color: hsl(var(--text-muted));
          cursor: pointer;
          transition: var(--transition-fast);
          padding: 2px;
        }

        .save-ribbon:hover {
          color: hsl(var(--accent-yellow));
        }

        .save-ribbon.saved {
          color: hsl(var(--accent-yellow));
        }

        .job-item-card .company {
          font-size: 0.85rem;
          color: hsl(var(--secondary));
          font-weight: 500;
          margin-bottom: 12px;
        }

        .meta-badges {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }

        .location-badge {
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
          font-weight: 500;
        }

        .tags-row, .tags-block {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .tag-badge {
          font-size: 0.7rem;
          font-weight: 600;
          background-color: hsl(var(--bg-dark));
          border: 1px solid hsl(var(--border-color));
          color: hsl(var(--text-secondary));
          padding: 4px 8px;
          border-radius: 4px;
        }

        /* Details Pane */
        .job-details-pane {
          padding: 30px;
          min-height: 450px;
          max-height: calc(100vh - var(--navbar-height) - 150px);
          overflow-y: auto;
          position: sticky;
          top: calc(var(--navbar-height) + 30px);
        }

        .details-container {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .details-header-block {
          border-bottom: 1px solid hsl(var(--border-color));
          padding-bottom: 24px;
        }

        .details-header-block h2 {
          font-size: 1.8rem;
          margin-bottom: 4px;
        }

        .company-link {
          font-size: 1.05rem;
          color: hsl(var(--secondary));
          font-weight: 600;
          margin-bottom: 20px;
        }

        .details-meta-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
          border-top: 1px solid hsl(var(--border-color) / 0.5);
          padding-top: 20px;
        }

        .meta-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .meta-box span {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: hsl(var(--text-muted));
          font-weight: 700;
        }

        .meta-box strong {
          font-size: 0.95rem;
          color: white;
        }

        .details-desc-block h3 {
          font-size: 1.2rem;
          margin-bottom: 16px;
        }

        /* Rendered HTML styling for live desc */
        .html-description {
          line-height: 1.6;
          color: hsl(var(--text-secondary));
          font-size: 0.95rem;
        }

        .html-description p { margin-bottom: 14px; }
        .html-description ul { padding-left: 20px; margin-bottom: 14px; }
        .html-description li { margin-bottom: 6px; }

        .job-details-pane .empty-details {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 380px;
          color: hsl(var(--text-muted));
          gap: 16px;
        }

        /* Modal Overlay and Wizard */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-content {
          width: 100%;
          max-width: 550px;
          padding: 30px;
          background: rgba(15, 18, 25, 0.95);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid hsl(var(--border-color));
          padding-bottom: 16px;
          margin-bottom: 24px;
        }

        .modal-header h3 {
          font-size: 1.25rem;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: hsl(var(--text-muted));
          cursor: pointer;
        }

        .steps-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 30px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: hsl(var(--text-muted));
        }

        .step-dot.active {
          color: hsl(var(--primary));
        }

        .step-line {
          flex: 1;
          height: 1px;
          background-color: hsl(var(--border-color));
        }

        .step-line.active {
          background-color: hsl(var(--primary));
        }

        .wizard-step {
          min-height: 250px;
        }

        .step-intro {
          font-size: 0.9rem;
          color: hsl(var(--text-muted));
          margin-bottom: 20px;
        }

        .modal-footer {
          display: flex;
          border-top: 1px solid hsl(var(--border-color));
          padding-top: 20px;
          margin-top: 24px;
        }

        /* Success Panel */
        .wizard-success-panel {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 30px 0;
        }

        .wizard-success-panel h3 { font-size: 1.5rem; }
        .wizard-success-panel p { color: hsl(var(--text-secondary)); font-size: 0.95rem; line-height: 1.5; margin-bottom: 10px; }

        .wizard-error-msg {
          color: hsl(var(--accent-red));
          font-size: 0.85rem;
          margin-bottom: 16px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .jobs-pane-grid {
            grid-template-columns: 1fr;
          }
          .job-details-pane {
            position: static;
            max-height: none;
          }
          .steps-indicator {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          .step-line { display: none; }
        }
      `}</style>
    </div>
  );
};

export default Jobs;
