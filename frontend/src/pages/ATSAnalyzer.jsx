import React, { useState, useEffect } from 'react';
import { atsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ATSAnalyzer = () => {
  const { user, reloadUser } = useAuth();
  const [resumeFile, setResumeFile] = useState(null);
  const [includeFeedback, setIncludeFeedback] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF resumes are supported by the analysis engine.');
        setResumeFile(null);
        return;
      }
      setResumeFile(file);
      setError('');
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF resumes are supported by the analysis engine.');
        setResumeFile(null);
        return;
      }
      setResumeFile(file);
      setError('');
    }
  };

  // Call the external ATS analyzer endpoint
  const handleStartScan = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setError('Please select or upload a resume PDF first.');
      return;
    }

    setError('');
    setIsScanning(true);
    setResult(null);
    setScanPhase('Connecting to analysis server...');

    // Dynamic timer to keep user updated during Render cold start (takes up to 50s)
    const startTime = Date.now();
    const statusInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed < 8) {
        setScanPhase('Connecting to analysis server...');
      } else if (elapsed < 25) {
        setScanPhase('Waking up Render backend service (this may take up to 60 seconds on first run)...');
      } else if (elapsed < 40) {
        setScanPhase('Extracting text content and structure from PDF...');
      } else if (elapsed < 55) {
        setScanPhase('Comparing skills against target career profiles...');
      } else {
        setScanPhase('Running LLM model (Phi-3.5-mini) to generate assessment...');
      }
    }, 1000);

    try {
      const data = await atsAPI.analyzeResume(resumeFile, includeFeedback);
      if (data && data.results) {
        setResult(data);
        // Reload user session to update auth state and unlock navigation gating
        try {
          await reloadUser();
        } catch (reloadErr) {
          console.error('Failed to reload user session details:', reloadErr);
        }
      } else {
        throw new Error('Analysis completed but returned an invalid report format.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unable to scan resume. Please ensure the backend service is awake and try again.');
    } finally {
      clearInterval(statusInterval);
      setIsScanning(false);
    }
  };

  // Color mapping based on score
  const getScoreColor = (score) => {
    if (score >= 70) return 'hsl(var(--accent-green))';
    if (score >= 40) return 'hsl(var(--accent-yellow))';
    return 'hsl(var(--accent-red))';
  };

  // Parse LLM feedback into clean section blocks
  const renderLLMFeedback = (feedbackText) => {
    if (!feedbackText) return null;
    const sections = feedbackText.split('\n\n');
    return (
      <div className="llm-feedback-section animate-fade-in">
        <h3>LLM Suggestions & Feedback</h3>
        <div className="feedback-cards-container">
          {sections.map((section, idx) => {
            if (!section.trim()) return null;
            
            const parts = section.split(': ');
            if (parts.length >= 2) {
              const title = parts[0].trim();
              const content = parts.slice(1).join(': ').trim();
              
              // Select icons and classes based on title content
              let icon = '💡';
              let cardClass = 'feedback-general';
              if (title.toLowerCase().includes('assessment')) {
                icon = '🎯';
                cardClass = 'feedback-assessment';
              } else if (title.toLowerCase().includes('strength')) {
                icon = '💪';
                cardClass = 'feedback-strengths';
              } else if (title.toLowerCase().includes('missing')) {
                icon = '⚠️';
                cardClass = 'feedback-missing';
              } else if (title.toLowerCase().includes('suggestion') || title.toLowerCase().includes('improvement')) {
                icon = '🚀';
                cardClass = 'feedback-suggestions';
              }

              return (
                <div key={idx} className={`feedback-card ${cardClass}`}>
                  <div className="card-header">
                    <span className="card-icon">{icon}</span>
                    <strong className="card-title">{title}</strong>
                  </div>
                  <p className="card-body-text">{content}</p>
                </div>
              );
            } else {
              return (
                <div key={idx} className="feedback-card feedback-general">
                  <p className="card-body-text">{section}</p>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="ats-wrapper animate-fade-in">
      {!user?.atsTopMatch?.role && (
        <div className="notification-banner notification-warning animate-slide-up" style={{ marginBottom: '24px', backgroundColor: 'hsl(var(--accent-yellow) / 0.1)', border: '1px solid hsl(var(--accent-yellow) / 0.3)', color: 'hsl(var(--accent-yellow))', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div>
            <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem' }}>Resume Scan Required</h4>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', opacity: 0.9 }}>
              Please upload and scan your resume first to build your career profile, unlock your personalized courses, and matching jobs!
            </p>
          </div>
        </div>
      )}
      <div className="ats-layout-grid">
        
        {/* Left Side: Upload Inputs */}
        <div className="inputs-column glass-panel animate-slide-up">
          <h3>ATS Optimizer</h3>
          <p className="subtitle">Upload your resume PDF to match keywords, discover detected skills, and see match scores for different career paths.</p>

          <form onSubmit={handleStartScan}>
            {/* File Dropzone */}
            <div className="form-group">
              <label className="form-label">Upload Resume (PDF Only)</label>
              <div 
                className={`dropzone ${resumeFile ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  id="resume-upload" 
                  accept=".pdf"
                  onChange={handleFileChange} 
                  style={{ display: 'none' }}
                />
                
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="dropzone-icon">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>

                {resumeFile ? (
                  <div className="file-details">
                    <p className="filename">{resumeFile.name}</p>
                    <span className="filesize">{(resumeFile.size / 1024).toFixed(1)} KB</span>
                    <button type="button" className="btn btn-secondary btn-sm change-file-btn" onClick={() => setResumeFile(null)}>Change File</button>
                  </div>
                ) : (
                  <label htmlFor="resume-upload" className="dropzone-label">
                    <strong>Drag and drop resume here</strong> or <span>browse files</span>
                    <p className="formats">Supports PDF up to 5MB</p>
                  </label>
                )}
              </div>
            </div>

            {/* Checkbox for LLM Feedback */}
            <div className="form-group checkbox-wrapper">
              <label className="check-label">
                <input 
                  type="checkbox" 
                  className="check-input"
                  checked={includeFeedback}
                  onChange={(e) => setIncludeFeedback(e.target.checked)}
                  disabled={isScanning}
                />
                <span className="check-text">
                  Include LLM feedback (slower — loads Phi-3.5-mini on first run)
                </span>
              </label>
            </div>

            {error && <p className="ats-error">{error}</p>}

            <button type="submit" className="btn btn-primary glow-btn scan-submit-btn" disabled={isScanning || !resumeFile}>
              {isScanning ? (
                <>
                  <span className="spinner-loader"></span>
                  Analyzing Resume...
                </>
              ) : 'Analyze Resume'}
            </button>
          </form>
        </div>

        {/* Right Side: Loaders or Results display */}
        <div className="results-column glass-panel">
          {isScanning ? (
            <div className="scanner-loading-view animate-fade-in">
              <div className="radar-circle animate-float">
                <div className="radar-sweep"></div>
                <div className="pulse-circle"></div>
              </div>
              <h4>Analyzing Resume Details</h4>
              <p className="loading-phase">{scanPhase}</p>
              <span className="wake-up-hint">
                Note: External backends spin down on inactivity. This may take up to 60 seconds on the first run.
              </span>
            </div>
          ) : result ? (
            <div className="analysis-results animate-fade-in">
              <h3>Scan Results</h3>
              <p className="result-filename">Report for: <strong>{resumeFile?.name || 'Uploaded Document'}</strong></p>

              {/* Top Match Hero Block */}
              <div className="top-match-hero-block">
                <div className="top-match-header">
                  <span className="hero-badge">Top Match</span>
                  <h4>{result.top_match?.Role}</h4>
                </div>
                <div className="hero-score-wrapper">
                  <span className="hero-score-num" style={{ color: getScoreColor(result.top_match?.['ATS Score']) }}>
                    {result.top_match?.['ATS Score']}%
                  </span>
                  <span className="hero-score-lbl">ATS Compatibility</span>
                </div>
              </div>

              {/* Detected Skills */}
              <div className="detected-skills-section">
                <h4>Detected Skills</h4>
                {result.resume_skills_detected && result.resume_skills_detected.length > 0 ? (
                  <div className="skills-pill-container">
                    {result.resume_skills_detected.map((skill, index) => (
                      <span key={index} className="skill-pill-detected">{skill}</span>
                    ))}
                  </div>
                ) : (
                  <p className="no-skills-text">No skills detected. Try adding clear skills keywords to your PDF.</p>
                )}
              </div>

              {/* Role Matches */}
              <div className="role-matches-section">
                <h4>Role Matches</h4>
                <div className="role-cards-container">
                  {result.results?.map((item, idx) => {
                    const isTop = item.Role === result.top_match?.Role;
                    const score = item['ATS Score'];
                    return (
                      <div key={idx} className={`role-match-card ${isTop ? 'is-top-match' : ''}`}>
                        <div className="role-card-header">
                          <span className="role-title">
                            {item.Role} {isTop && <span className="top-role-badge">Top Match</span>}
                          </span>
                          <span className="role-score-badge" style={{ color: getScoreColor(score), backgroundColor: `${getScoreColor(score)}14` }}>
                            {score}% Match
                          </span>
                        </div>

                        {/* Custom Progress Bar */}
                        <div className="progress-container">
                          <div 
                            className="progress-bar" 
                            style={{ 
                              width: `${score}%`, 
                              backgroundColor: getScoreColor(score),
                              boxShadow: `0 0 8px ${getScoreColor(score)}33`
                            }}
                          ></div>
                        </div>

                        {/* Skill Badges */}
                        <div className="role-card-skills">
                          {/* Matched Skills */}
                          {item['Matched Skills']?.map((skill, sIdx) => (
                            <span key={`match-${sIdx}`} className="badge-skill match-skill" title="Matched Skill">
                              ✓ {skill}
                            </span>
                          ))}

                          {/* Missing Skills */}
                          {item['Missing Skills']?.map((skill, sIdx) => (
                            <span key={`miss-${sIdx}`} className="badge-skill miss-skill" title="Missing Skill">
                              + {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LLM Feedback Card */}
              {renderLLMFeedback(result.feedback)}

            </div>
          ) : (
            <div className="empty-results">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--text-muted))' }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16V12" />
                <path d="M12 8H12.01" />
              </svg>
              <p>Ready to analyze. Upload your resume PDF and click "Analyze Resume" to view your compatibility and feedback reports.</p>
            </div>
          )}
        </div>

      </div>

      <style>{`
        .ats-wrapper {
          display: flex;
          flex-direction: column;
        }

        .ats-layout-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 30px;
          align-items: start;
        }

        .inputs-column, .results-column {
          padding: 30px;
        }

        .inputs-column h3, .results-column h3 {
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: hsl(var(--text-primary));
        }

        .subtitle {
          font-size: 0.9rem;
          color: hsl(var(--text-secondary));
          margin-bottom: 24px;
          line-height: 1.5;
        }

        /* Dropzone */
        .dropzone {
          border: 2px dashed hsl(var(--border-color));
          border-radius: var(--radius-md);
          background-color: hsl(var(--bg-dark));
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .dropzone:hover {
          border-color: hsl(var(--primary));
          background-color: hsl(var(--primary-glow));
        }

        .dropzone.has-file {
          border-style: solid;
          border-color: hsl(var(--primary));
          background: hsl(var(--primary) / 0.02);
        }

        .dropzone-icon {
          color: hsl(var(--text-muted));
          margin-bottom: 16px;
          transition: var(--transition-fast);
        }

        .dropzone:hover .dropzone-icon,
        .dropzone.has-file .dropzone-icon {
          color: hsl(var(--primary));
          transform: translateY(-2px);
        }

        .dropzone-label {
          cursor: pointer;
          color: hsl(var(--text-secondary));
          font-size: 0.95rem;
        }

        .dropzone-label span {
          color: hsl(var(--primary));
          font-weight: 600;
          text-decoration: underline;
        }

        .formats {
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
          margin-top: 8px;
        }

        .file-details {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .file-details .filename {
          font-weight: 700;
          color: hsl(var(--text-primary));
          font-size: 0.95rem;
          word-break: break-all;
        }

        .file-details .filesize {
          font-size: 0.8rem;
          color: hsl(var(--text-muted));
        }

        .change-file-btn {
          margin-top: 6px;
        }

        /* Checkbox */
        .checkbox-wrapper {
          margin-top: 24px;
          margin-bottom: 20px;
        }

        .check-label {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
          user-select: none;
        }

        .check-input {
          margin-top: 3px;
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .check-text {
          font-size: 0.875rem;
          color: hsl(var(--text-secondary));
          line-height: 1.4;
        }

        .scan-submit-btn {
          width: 100%;
          padding: 14px;
          font-size: 1rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 700;
        }

        .ats-error {
          color: hsl(var(--accent-red));
          font-size: 0.875rem;
          margin-bottom: 16px;
          font-weight: 600;
        }

        /* Loading Spinner inside Button */
        .spinner-loader {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }

        /* Loading View */
        .scanner-loading-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
          gap: 16px;
          padding: 40px 20px;
        }

        .radar-circle {
          position: relative;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          border: 2px solid hsl(var(--border-color));
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 8px;
          background: hsl(var(--bg-dark));
        }

        .radar-sweep {
          position: absolute;
          width: 100%;
          height: 100%;
          background: conic-gradient(from 0deg, transparent 50%, hsl(var(--primary) / 0.2) 100%);
          border-radius: 50%;
          animation: spin 2.5s linear infinite;
        }

        .pulse-circle {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background-color: hsl(var(--primary));
          z-index: 2;
          box-shadow: 0 0 12px hsl(var(--primary));
        }

        .loading-phase {
          font-weight: 700;
          font-size: 1rem;
          color: hsl(var(--text-primary));
          max-width: 320px;
          min-height: 40px;
        }

        .wake-up-hint {
          font-size: 0.8rem;
          color: hsl(var(--text-muted));
          max-width: 280px;
          line-height: 1.4;
        }

        /* Results Display */
        .result-filename {
          font-size: 0.85rem;
          color: hsl(var(--text-secondary));
          margin-bottom: 24px;
        }

        /* Top Match Hero Block */
        .top-match-hero-block {
          background: linear-gradient(135deg, hsl(var(--primary) / 0.05) 0%, hsl(var(--primary) / 0.01) 100%);
          border: 1px solid hsl(var(--primary) / 0.15);
          border-radius: var(--radius-md);
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .top-match-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .hero-badge {
          background-color: hsl(var(--primary));
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 4px 8px;
          border-radius: 4px;
          align-self: flex-start;
        }

        .top-match-header h4 {
          font-size: 1.3rem;
          font-weight: 800;
          color: hsl(var(--text-primary));
        }

        .hero-score-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .hero-score-num {
          font-family: var(--font-title);
          font-size: 2.2rem;
          font-weight: 800;
          line-height: 1.1;
        }

        .hero-score-lbl {
          font-size: 0.75rem;
          color: hsl(var(--text-secondary));
          font-weight: 600;
        }

        /* Detected Skills */
        .detected-skills-section {
          margin-bottom: 30px;
        }

        .detected-skills-section h4,
        .role-matches-section h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: hsl(var(--text-secondary));
        }

        .skills-pill-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .skill-pill-detected {
          background-color: hsl(var(--bg-dark));
          border: 1px solid hsl(var(--border-color));
          color: hsl(var(--text-primary));
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .no-skills-text {
          font-size: 0.875rem;
          color: hsl(var(--text-muted));
          font-style: italic;
        }

        /* Role Matches Section */
        .role-matches-section {
          margin-bottom: 30px;
        }

        .role-cards-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .role-match-card {
          border: 1px solid hsl(var(--border-color));
          background: hsl(var(--bg-card));
          border-radius: var(--radius-md);
          padding: 20px;
          transition: var(--transition-normal);
        }

        .role-match-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
          border-color: hsl(var(--text-muted) / 0.4);
        }

        .role-match-card.is-top-match {
          border-color: hsl(var(--primary) / 0.3);
          background: linear-gradient(to right, hsl(var(--primary) / 0.02), transparent);
        }

        .role-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .role-title {
          font-size: 1rem;
          font-weight: 700;
          color: hsl(var(--text-primary));
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .top-role-badge {
          background-color: hsl(var(--primary) / 0.1);
          color: hsl(var(--primary));
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .role-score-badge {
          font-size: 0.8rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 12px;
        }

        /* Progress Bars */
        .progress-container {
          height: 6px;
          background-color: hsl(var(--bg-dark));
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .progress-bar {
          height: 100%;
          border-radius: 3px;
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Skills Lists inside Role Cards */
        .role-card-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .badge-skill {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .badge-skill.match-skill {
          background-color: hsl(var(--accent-green) / 0.08);
          color: hsl(var(--accent-green));
          border: 1px solid hsl(var(--accent-green) / 0.2);
        }

        .badge-skill.miss-skill {
          background-color: hsl(var(--accent-red) / 0.08);
          color: hsl(var(--accent-red));
          border: 1px solid hsl(var(--accent-red) / 0.2);
        }

        /* LLM Feedback Section */
        .llm-feedback-section {
          border-top: 1px solid hsl(var(--border-color));
          padding-top: 30px;
          margin-top: 30px;
        }

        .llm-feedback-section h3 {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 18px;
          color: hsl(var(--text-primary));
        }

        .feedback-cards-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feedback-card {
          border-radius: var(--radius-md);
          padding: 20px;
          border-left: 4px solid;
          background: hsl(var(--bg-dark));
          line-height: 1.5;
        }

        .feedback-card .card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .feedback-card .card-icon {
          font-size: 1.1rem;
        }

        .feedback-card .card-title {
          font-family: var(--font-title);
          font-size: 0.95rem;
          color: hsl(var(--text-primary));
        }

        .feedback-card .card-body-text {
          font-size: 0.9rem;
          color: hsl(var(--text-secondary));
        }

        .feedback-assessment {
          border-left-color: hsl(var(--primary));
          background-color: hsl(var(--primary) / 0.02);
        }

        .feedback-strengths {
          border-left-color: hsl(var(--accent-green));
          background-color: hsl(var(--accent-green) / 0.02);
        }

        .feedback-missing {
          border-left-color: hsl(var(--accent-red));
          background-color: hsl(var(--accent-red) / 0.02);
        }

        .feedback-suggestions {
          border-left-color: hsl(var(--accent-yellow));
          background-color: hsl(var(--accent-yellow) / 0.02);
        }

        .feedback-general {
          border-left-color: hsl(var(--text-muted));
          background-color: hsl(var(--bg-dark));
        }

        /* Empty Results View */
        .results-column .empty-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: hsl(var(--text-muted));
          text-align: center;
          gap: 16px;
          padding: 0 20px;
        }

        .results-column .empty-results p {
          font-size: 0.95rem;
          line-height: 1.5;
          max-width: 320px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 992px) {
          .ats-layout-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ATSAnalyzer;
