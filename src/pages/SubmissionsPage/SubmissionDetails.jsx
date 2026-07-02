import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useAuthContext } from '../../hooks/useAuthContext';
import Loader from '../../components/Loader/Loader';
import { 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiCpu, 
  FiDatabase, 
  FiCode, 
  FiCopy, 
  FiDownload, 
  FiShare2, 
  FiCornerDownRight,
  FiChevronRight,
  FiCheck
} from 'react-icons/fi';
import './SubmissionDetails.css';

const SubmissionDetails = () => {
  const { submissionId } = useParams();
  const { user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [question, setQuestion] = useState(null);
  
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [editorTheme, setEditorTheme] = useState('vs-dark');

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/user/solutions/detail/${submissionId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Submission not found.');
          }
          throw new Error('Failed to load submission details.');
        }
        const data = await response.json();
        setSubmission(data.solution);
        setQuestion(data.question);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionDetails();
  }, [submissionId]);

  const handleCopyCode = () => {
    if (!submission?.solution) return;
    navigator.clipboard.writeText(submission.solution)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy code:', err));
  };

  const handleDownloadCode = () => {
    if (!submission?.solution) return;
    
    // Determine extension
    let ext = 'txt';
    const lang = (submission.language || '').toLowerCase();
    if (lang.includes('js') || lang.includes('javascript')) ext = 'js';
    else if (lang.includes('python') || lang.includes('py')) ext = 'py';
    else if (lang.includes('java')) ext = 'java';
    else if (lang.includes('cpp') || lang.includes('c++')) ext = 'cpp';
    else if (lang.includes('c')) ext = 'c';

    const blob = new Blob([submission.solution], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `solution_${submissionId}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      })
      .catch(err => console.error('Failed to copy share link:', err));
  };

  if (loading) {
    return <Loader title="Loading Details" subtitle="Fetching submission results and source code..." />;
  }

  if (error || !submission) {
    return (
      <div className="submission-details-error">
        <FiXCircle size={48} className="error-icon" />
        <h2>Details Not Found</h2>
        <p>{error || 'Requested submission details could not be retrieved.'}</p>
        <button onClick={() => navigate('/submissions')} className="back-btn">
          Back to Submissions
        </button>
      </div>
    );
  }

  const isAccepted = submission.verdict === 'Accepted';
  const submissionDate = new Date(submission.createdAt);
  const formattedDate = submissionDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) + ' at ' + submissionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Map display language slug to editor language
  let editorLanguage = 'javascript';
  const displayLang = (submission.language || '').toLowerCase();
  if (displayLang === 'python' || displayLang === 'python3') editorLanguage = 'python';
  else if (displayLang === 'java') editorLanguage = 'java';
  else if (displayLang === 'cpp' || displayLang === 'c++') editorLanguage = 'cpp';
  else if (displayLang === 'c') editorLanguage = 'c';

  // Fallback for passed / failed cases if not present in schema
  const passedCasesCount = submission.passedCount !== undefined ? submission.passedCount : (isAccepted ? 1 : 0);
  const totalCasesCount = submission.totalCount !== undefined ? submission.totalCount : (isAccepted ? 1 : 1);
  const passedPercentage = totalCasesCount > 0 ? Math.round((passedCasesCount / totalCasesCount) * 100) : 0;

  return (
    <div className="submission-details-container">
      {/* 1. Header Banner */}
      <div className="details-header-card">
        <div className="breadcrumb-nav">
          <Link to="/submissions">Submissions</Link>
          <FiChevronRight className="chevron-icon" />
          <span className="current">Details</span>
        </div>

        <div className="details-main-title">
          <div className="title-left">
            <h2>
              Submission details for{' '}
              {question ? (
                <Link to={`/practice/${question.titleSlug}`} className="problem-link">
                  {question.title}
                </Link>
              ) : (
                submission.title || 'Coding Problem'
              )}
            </h2>
            <p className="submitted-by">
              Submitted by <strong>{submission.username}</strong> on {formattedDate}
            </p>
          </div>
          <div className="title-right">
            {question && (
              <span className={`diff-badge ${question.difficulty.toLowerCase()}`}>
                {question.difficulty}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Grid Dashboard */}
      <div className="details-grid">
        {/* Left Side: Stats and test cases */}
        <div className="grid-left">
          {/* Verdict Overview Card */}
          <div className={`verdict-overview-card ${isAccepted ? 'success' : 'failed'}`}>
            <div className="verdict-banner">
              {isAccepted ? (
                <FiCheckCircle className="verdict-icon accepted" />
              ) : (
                <FiXCircle className="verdict-icon rejected" />
              )}
              <div className="verdict-text-group">
                <span className="verdict-label">Verdict</span>
                <h1 className={`verdict-title ${isAccepted ? 'accepted' : 'rejected'}`}>
                  {submission.verdict}
                </h1>
              </div>
            </div>

            <div className="stats-strip">
              <div className="strip-item">
                <FiClock className="strip-icon" />
                <div className="strip-info">
                  <span>Runtime</span>
                  <strong>{submission.runtime || 'N/A'}</strong>
                </div>
              </div>
              <div className="strip-item">
                <FiDatabase className="strip-icon" />
                <div className="strip-info">
                  <span>Memory</span>
                  <strong>{submission.memory || 'N/A'}</strong>
                </div>
              </div>
              <div className="strip-item">
                <FiCode className="strip-icon" />
                <div className="strip-info">
                  <span>Language</span>
                  <strong className="lang-text">{submission.language}</strong>
                </div>
              </div>
            </div>

            {/* Testcase Progress Bar */}
            <div className="testcase-progress-wrapper">
              <div className="progress-label-row">
                <span>Test Cases Passed</span>
                <strong>{passedCasesCount} / {totalCasesCount} ({passedPercentage}%)</strong>
              </div>
              <div className="progress-bar-container">
                <div 
                  className={`progress-bar ${isAccepted ? 'accepted' : 'rejected'}`} 
                  style={{ width: `${passedPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Test Case Execution Log */}
          {submission.results && submission.results.length > 0 && (
            <div className="testcase-log-card">
              <h3>Detailed Test Case Results</h3>
              <div className="logs-list">
                {submission.results.map((result, idx) => {
                  const tcAccepted = result.verdict === 'Accepted';
                  return (
                    <div key={idx} className={`log-row ${tcAccepted ? 'pass' : 'fail'}`}>
                      <div className="log-row-header">
                        <div className="header-left">
                          <FiCornerDownRight className="chevron-log" />
                          <span>Test Case #{idx + 1}</span>
                        </div>
                        <div className="header-right">
                          <span className={`log-verdict ${tcAccepted ? 'pass' : 'fail'}`}>
                            {result.verdict}
                          </span>
                          <span className="log-meta">{result.time || '0 ms'}</span>
                          <span className="log-meta">{result.memory || '0 MB'}</span>
                        </div>
                      </div>

                      {/* Display failure input details */}
                      {!tcAccepted && (result.input || result.expected_output || result.stdout || result.compile_output) && (
                        <div className="log-row-details">
                          {result.input && (
                            <div className="detail-item">
                              <span className="detail-label">Input</span>
                              <pre className="detail-pre">{result.input}</pre>
                            </div>
                          )}
                          {result.expected_output && (
                            <div className="detail-item">
                              <span className="detail-label">Expected Output</span>
                              <pre className="detail-pre success-pre">{result.expected_output}</pre>
                            </div>
                          )}
                          {result.stdout && (
                            <div className="detail-item">
                              <span className="detail-label">Actual Output (stdout)</span>
                              <pre className="detail-pre error-pre">{result.stdout}</pre>
                            </div>
                          )}
                          {result.stderr && (
                            <div className="detail-item">
                              <span className="detail-label">Standard Error (stderr)</span>
                              <pre className="detail-pre error-pre">{result.stderr}</pre>
                            </div>
                          )}
                          {result.compile_output && (
                            <div className="detail-item">
                              <span className="detail-label">Compile Output</span>
                              <pre className="detail-pre error-pre">{result.compile_output}</pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Code Editor with Actions */}
        <div className="grid-right">
          <div className="code-viewer-card">
            <div className="card-header">
              <div className="header-left">
                <FiCode className="code-icon-title" />
                <span>Submitted Code</span>
              </div>
              <div className="header-right">
                <select 
                  value={editorTheme} 
                  onChange={(e) => setEditorTheme(e.target.value)}
                  className="theme-select"
                >
                  <option value="vs-dark">vs-dark</option>
                  <option value="light">light</option>
                </select>
                
                <button className="action-icon-btn" onClick={handleCopyCode} title="Copy Code">
                  {copied ? <FiCheck className="copied-icon" /> : <FiCopy />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button className="action-icon-btn" onClick={handleDownloadCode} title="Download Code">
                  <FiDownload />
                  <span>Download</span>
                </button>
                <button className="action-icon-btn" onClick={handleShare} title="Share Submission">
                  {shared ? <FiCheck className="copied-icon" /> : <FiShare2 />}
                  <span>{shared ? 'Shared Link' : 'Share'}</span>
                </button>
              </div>
            </div>

            <div className="editor-viewport">
              <Editor
                height="450px"
                language={editorLanguage}
                theme={editorTheme}
                value={submission.solution}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  lineNumbers: 'on',
                  automaticLayout: true,
                  fontFamily: 'Fira Code, Source Code Pro, Courier New, monospace'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetails;
