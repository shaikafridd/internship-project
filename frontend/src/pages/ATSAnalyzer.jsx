import React, { useState } from 'react';
import { atsAPI } from '../services/api';

const ATSAnalyzer = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  
  // Loader phase steps
  const [isScanning, setIsScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState('');
  
  // Results
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setResumeFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleStartScan = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setError('Please select or upload a resume file first.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please paste a job description for comparison.');
      return;
    }

    setError('');
    setIsScanning(true);
    setResult(null);

    // Phase simulation for nice UX
    const phases = [
      'Extracting text content from document...',
      'Checking document layout structure...',
      'Auditing section headings and headings hierarchy...',
      'Analyzing keywords relevance to job description...',
      'Synthesizing final ATS score report...'
    ];

    for (let i = 0; i < phases.length; i++) {
      setScanPhase(phases[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const res = await atsAPI.analyzeResume(resumeFile.name);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        throw new Error(res.message || 'ATS analysis failed');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unable to scan resume');
    } finally {
      setIsScanning(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'hsl(var(--accent-green))';
    if (score >= 60) return 'hsl(var(--accent-yellow))';
    return 'hsl(var(--accent-red))';
  };

  return (
    <div className="ats-wrapper animate-fade-in">
      <div className="ats-layout-grid">
        
        {/* Left Side: Upload Inputs */}
        <div className="inputs-column glass-panel animate-slide-up">
          <h3>ATS Optimizer</h3>
          <p className="subtitle">Upload your resume and paste the target job description to match keywords and structures.</p>

          <form onSubmit={handleStartScan}>
            {/* File Dropzone */}
            <div className="form-group">
              <label className="form-label">Upload Resume (PDF/Word)</label>
              <div 
                className={`dropzone ${resumeFile ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  id="resume-upload" 
                  accept=".pdf,.doc,.docx"
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
                    <p className="formats">Supports PDF, DOC, DOCX up to 5MB</p>
                  </label>
                )}
              </div>
            </div>

            {/* Job Description Textarea */}
            <div className="form-group">
              <label className="form-label">Job Description</label>
              <textarea
                className="form-control desc-input"
                rows="6"
                placeholder="Paste the job description you are applying for here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
              />
            </div>

            {error && <p className="ats-error">{error}</p>}

            <button type="submit" className="btn btn-primary glow-btn scan-submit-btn" disabled={isScanning}>
              {isScanning ? 'Running Scan...' : 'Analyze Resume'}
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
              <span>This takes about 5 seconds.</span>
            </div>
          ) : result ? (
            <div className="analysis-results animate-fade-in">
              <h3>Scan Results</h3>
              <p className="result-filename">Report for: <strong>{result.filename}</strong></p>

              {/* Overall Score Circle SVG */}
              <div className="score-summary-block">
                <div className="score-circle-wrapper">
                  <svg className="svg-circle" width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" className="circle-bg" />
                    <circle 
                      cx="60" cy="60" r="50" 
                      className="circle-progress"
                      style={{
                        stroke: getScoreColor(result.atsScore),
                        strokeDasharray: '314.16',
                        strokeDashoffset: (314.16 - (314.16 * result.atsScore) / 100).toString()
                      }}
                    />
                  </svg>
                  <div className="score-text">
                    <span className="number">{result.atsScore}%</span>
                    <span className="label">ATS Match</span>
                  </div>
                </div>

                <div className="score-feedback">
                  <span className={`badge ${result.atsScore >= 80 ? 'badge-success' : 'badge-warning'}`}>
                    {result.feedback}
                  </span>
                  <h4>{result.summary}</h4>
                </div>
              </div>

              {/* Score Breakdown Bars */}
              <div className="score-breakdown">
                <h4>Category Breakdown</h4>
                
                <div className="breakdown-item">
                  <div className="item-label-row">
                    <span>Formatting & Typography</span>
                    <span>{result.breakdown?.formatting}%</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${result.breakdown?.formatting}%`, background: getScoreColor(result.breakdown?.formatting) }}></div>
                  </div>
                </div>

                <div className="breakdown-item">
                  <div className="item-label-row">
                    <span>Keywords Match</span>
                    <span>{result.breakdown?.keywords}%</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${result.breakdown?.keywords}%`, background: getScoreColor(result.breakdown?.keywords) }}></div>
                  </div>
                </div>

                <div className="breakdown-item">
                  <div className="item-label-row">
                    <span>Content Structure</span>
                    <span>{result.breakdown?.content}%</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${result.breakdown?.content}%`, background: getScoreColor(result.breakdown?.content) }}></div>
                  </div>
                </div>

                <div className="breakdown-item">
                  <div className="item-label-row">
                    <span>Relevant Experience</span>
                    <span>{result.breakdown?.experience}%</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${result.breakdown?.experience}%`, background: getScoreColor(result.breakdown?.experience) }}></div>
                  </div>
                </div>
              </div>

              {/* Recommendations & Tips */}
              <div className="recommendations-block">
                <h4>Action Recommendation</h4>
                <div className="rec-card">
                  <p>{result.topRecommendation}</p>
                </div>

                <h4 style={{ marginTop: '24px', marginBottom: '12px' }}>Optimization Tips</h4>
                <ul className="tips-list">
                  {result.tips?.map((tip, idx) => (
                    <li key={idx}>
                      <span className="bullet">&rarr;</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="empty-results">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--text-muted))' }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16V12" />
                <path d="M12 8H12.01" />
              </svg>
              <p>Ready to analyze. Upload your resume and paste the job description, then click "Analyze Resume" to see your score.</p>
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
          grid-template-columns: 1.2fr 1fr;
          gap: 30px;
          align-items: start;
        }

        .inputs-column, .results-column {
          padding: 30px;
        }

        .inputs-column h3, .results-column h3 {
          font-size: 1.3rem;
          margin-bottom: 6px;
        }

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
          background-color: hsl(var(--bg-card));
        }

        .dropzone.has-file {
          border-style: solid;
          border-color: hsl(var(--primary));
          background: hsl(var(--primary) / 0.03);
        }

        .dropzone-icon {
          color: hsl(var(--text-muted));
          margin-bottom: 16px;
        }

        .dropzone.has-file .dropzone-icon {
          color: hsl(var(--primary));
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
          gap: 6px;
        }

        .file-details .filename {
          font-weight: 700;
          color: white;
          font-size: 0.95rem;
        }

        .file-details .filesize {
          font-size: 0.8rem;
          color: hsl(var(--text-muted));
          margin-bottom: 8px;
        }

        .desc-input {
          resize: vertical;
        }

        .scan-submit-btn {
          width: 100%;
          padding: 14px;
          font-size: 1rem;
          margin-top: 10px;
        }

        .ats-error {
          color: hsl(var(--accent-red));
          font-size: 0.9rem;
          margin-bottom: 16px;
          font-weight: 600;
        }

        /* Loading View */
        .scanner-loading-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 380px;
          text-align: center;
          gap: 16px;
        }

        .radar-circle {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 2px solid hsl(var(--border-color));
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .radar-sweep {
          position: absolute;
          width: 100%;
          height: 100%;
          background: conic-gradient(from 0deg, transparent 50%, hsl(var(--primary) / 0.4) 100%);
          border-radius: 50%;
          animation: spin 2s linear infinite;
        }

        .pulse-circle {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: hsl(var(--primary));
          z-index: 2;
          box-shadow: 0 0 10px hsl(var(--primary));
        }

        .loading-phase {
          font-weight: 700;
          font-size: 1.05rem;
          color: white;
        }

        .scanner-loading-view span {
          font-size: 0.85rem;
          color: hsl(var(--text-muted));
        }

        /* Results Display */
        .result-filename {
          font-size: 0.85rem;
          color: hsl(var(--text-secondary));
          margin-bottom: 24px;
        }

        .score-summary-block {
          display: flex;
          align-items: center;
          gap: 24px;
          border-bottom: 1px solid hsl(var(--border-color));
          padding-bottom: 24px;
          margin-bottom: 24px;
        }

        .score-circle-wrapper {
          position: relative;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .svg-circle {
          transform: rotate(-90deg);
        }

        .circle-bg {
          fill: none;
          stroke: hsl(var(--border-color));
          stroke-width: 8;
        }

        .circle-progress {
          fill: none;
          stroke-width: 8;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.6s ease;
        }

        .score-text {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .score-text .number {
          font-family: var(--font-title);
          font-size: 1.6rem;
          font-weight: 800;
          color: white;
          line-height: 1.1;
        }

        .score-text .label {
          font-size: 0.7rem;
          color: hsl(var(--text-muted));
          font-weight: 700;
          text-transform: uppercase;
        }

        .score-feedback {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          flex: 1;
        }

        .score-feedback h4 {
          font-size: 1.15rem;
          line-height: 1.4;
          color: white;
        }

        /* Categories */
        .score-breakdown {
          border-bottom: 1px solid hsl(var(--border-color));
          padding-bottom: 24px;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .breakdown-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .item-label-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: hsl(var(--text-secondary));
          font-weight: 500;
        }

        /* Recommendations */
        .rec-card {
          padding: 16px;
          background-color: rgba(255,255,255,0.02);
          border: 1px dashed hsl(var(--primary) / 0.5);
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          line-height: 1.5;
          color: hsl(var(--text-secondary));
        }

        .tips-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          list-style: none;
        }

        .tips-list li {
          display: flex;
          gap: 12px;
          font-size: 0.9rem;
          color: hsl(var(--text-secondary));
          line-height: 1.4;
        }

        .tips-list .bullet {
          color: hsl(var(--primary));
          font-weight: 700;
        }

        .results-column .empty-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 380px;
          color: hsl(var(--text-muted));
          text-align: center;
          gap: 16px;
          padding: 0 20px;
        }

        .results-column .empty-results p {
          font-size: 0.95rem;
          line-height: 1.5;
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
