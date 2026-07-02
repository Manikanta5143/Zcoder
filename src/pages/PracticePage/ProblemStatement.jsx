import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useProblemStatementApi } from '../../hooks/useProblemStatementApi';
import ProblemPanel from './components/ProblemPanel';
import MonacoEditorComponent from './components/MonacoEditor';
import TestCasePanel from './components/TestCasePanel';
import Loader from '../../components/Loader/Loader';
import { IoMdBookmark, IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { 
  FiPlay, 
  FiCheck, 
  FiFileText, 
  FiUsers, 
  FiMaximize, 
  FiMinimize, 
  FiRefreshCw, 
  FiCopy, 
  FiSettings, 
  FiBookOpen, 
  FiCheckCircle 
} from 'react-icons/fi';
import styles from './ProblemStatement.module.css';

const ProblemStatement = () => {
  const { titleSlug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();

  // Left Panel Tabs
  const [leftTab, setLeftTab] = useState('description'); // 'description' | 'solutions' | 'submissions'

  // Code state
  const [language, setLanguage] = useState('javascript');
  const [solution, setSolution] = useState('');
  const [codeMap, setCodeMap] = useState({}); // Keep track of edits per language

  // Peer Solutions and Comments (Existing Logic)
  const [solutions, setSolutions] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [activeSolution, setActiveSolution] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState({});

  // Personal Submission History
  const [personalSubmissions, setPersonalSubmissions] = useState([]);

  // Split Panel resizing state
  const [leftWidth, setLeftWidth] = useState(45); // percentage
  const containerRef = useRef(null);
  const isResizing = useRef(false);

  // Editor Toolbar settings
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Bottom TestCase Panel
  const [customInputs, setCustomInputs] = useState(['']);
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [testCaseTab, setTestCaseTab] = useState('testcases');
  const [runResult, setRunResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const { problem, loading, error } = useProblemStatementApi(titleSlug);

  // Load starter code on mount or when language/problem changes
  useEffect(() => {
    if (problem) {
      // Initialize code map with starter codes
      const initialCodeMap = {};
      if (problem.starterCode && Array.isArray(problem.starterCode)) {
        problem.starterCode.forEach(sc => {
          initialCodeMap[sc.langSlug] = sc.code;
        });
      }
      setCodeMap(prev => ({
        ...initialCodeMap,
        ...prev // preserve user edits if already loaded
      }));

      // Set initial solution code
      const defaultLang = 'javascript';
      setLanguage(defaultLang);
      const startCode = initialCodeMap[defaultLang] || '';
      setSolution(startCode);

      // Set initial testcases input
      if (problem.sampleTestCases && problem.sampleTestCases.length > 0) {
        setCustomInputs(problem.sampleTestCases.map(tc => tc.input));
      } else {
        setCustomInputs(['']);
      }
    }
  }, [problem]);

  // Load user submissions, bookmarks
  useEffect(() => {
    if (isAuthenticated && user && user._id) {
      fetchBookmarks(user._id);
      fetchPersonalSubmissions(user._id);
    } else {
      setBookmarks([]);
      setPersonalSubmissions([]);
    }
  }, [user, isAuthenticated]);

  const fetchBookmarks = async (userId) => {
    try {
      const response = await fetch(`/user/bookmarks/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const allSolutionIds = data.reduce((acc, bookmark) => {
          if (bookmark && bookmark.solutions && Array.isArray(bookmark.solutions)) {
            bookmark.solutions.forEach(solution => {
              if (solution && solution._id) {
                acc.push(solution._id);
              } else if (solution && solution.solutionId && solution.solutionId._id) {
                acc.push(solution.solutionId._id);
              }
            });
          }
          return acc;
        }, []);
        setBookmarks(allSolutionIds);
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    }
  };

  const fetchPersonalSubmissions = async (userId) => {
    try {
      const response = await fetch(`/user/solutions/byUser/${userId}`);
      if (response.ok) {
        const data = await response.json();
        // Filter submissions to match current question
        const filtered = data.filter(sub => sub.titleSlug === titleSlug);
        setPersonalSubmissions(filtered);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  // Fetch peer solutions
  const fetchPeerSolutions = async () => {
    try {
      const response = await fetch(`/user/solutions/${titleSlug}`);
      if (response.ok) {
        const data = await response.json();
        setSolutions(data);
      }
    } catch (err) {
      console.error('Failed to fetch peer solutions', err);
    }
  };

  // Fetch comments for solution
  const fetchComments = async (solutionId) => {
    if (showComments && activeSolution === solutionId) {
      setShowComments(false);
      return;
    }
    try {
      const response = await fetch(`/user/comments/${solutionId}`);
      const data = await response.json();
      setComments(prev => ({ ...prev, [solutionId]: data }));
      setShowComments(true);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handlePostComment = async (solutionId, commentText) => {
    if (!isAuthenticated || !user) {
      alert('You need to be logged in to post comments.');
      return;
    }
    try {
      const response = await fetch(`/user/comments/${solutionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText, userId: user._id, solutionId, username: user.username })
      });
      if (response.ok) {
        const newComment = await response.json();
        setComments(prev => ({
          ...prev,
          [solutionId]: [...(prev[solutionId] || []), newComment]
        }));
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  const handleBookmark = async (sol) => {
    if (!user || !user._id) {
      alert('You need to be logged in to bookmark solutions.');
      return;
    }

    const isBookmarked = bookmarks.includes(sol._id);
    if (!isBookmarked) {
      try {
        const response = await fetch('/user/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            solutionId: sol._id,
            userId: user._id,
            title: problem.title,
            titleSlug,
            language: sol.language,
            solution: sol.solution,
            topicTags: problem.topicTags
          })
        });
        if (response.ok) {
          setBookmarks(prev => [...prev, sol._id]);
        }
      } catch (err) {
        console.error('Error bookmarking:', err);
      }
    } else {
      try {
        const response = await fetch(`/user/bookmarks/${user._id}/${titleSlug}/${sol._id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setBookmarks(prev => prev.filter(id => id !== sol._id));
        }
      } catch (err) {
        console.error('Error deleting bookmark:', err);
      }
    }
  };

  // Language Change and Local Mapping
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    
    // Save current solution
    setCodeMap(prev => ({
      ...prev,
      [language]: solution
    }));

    // Update selection
    setLanguage(newLang);

    // Retrieve previous or starter code
    const savedCode = codeMap[newLang];
    if (savedCode !== undefined) {
      setSolution(savedCode);
    } else {
      const starterObj = problem.starterCode.find(sc => sc.langSlug === newLang);
      setSolution(starterObj ? starterObj.code : '');
    }
  };

  // Reset current language's code to original starter code
  const handleResetCode = () => {
    if (window.confirm('Are you sure you want to reset your editor to the original starter code?')) {
      const starterObj = problem.starterCode.find(sc => sc.langSlug === language);
      const cleanCode = starterObj ? starterObj.code : '';
      setSolution(cleanCode);
      setCodeMap(prev => ({
        ...prev,
        [language]: cleanCode
      }));
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(solution)
      .then(() => alert('Code copied to clipboard!'))
      .catch(err => console.error('Failed to copy code:', err));
  };

  // Execute single custom testcase on Judge0
  const handleRunCode = async () => {
    setIsRunning(true);
    setTestCaseTab('console');
    setRunResult(null);

    const activeInput = customInputs[selectedCaseIndex] || '';

    try {
      const response = await fetch(`/user/solutions/${titleSlug}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          sourceCode: solution,
          customInput: activeInput
        })
      });

      if (!response.ok) {
        throw new Error('Failed to execute code on server.');
      }

      const data = await response.json();
      const firstResult = data.results && data.results[0] ? data.results[0] : null;
      
      setRunResult({
        verdict: firstResult ? firstResult.verdict : 'Internal Error',
        runtime: firstResult ? firstResult.time : '0 ms',
        memory: firstResult ? firstResult.memory : '0 MB',
        results: data.results,
        failedTestcase: firstResult && firstResult.verdict !== 'Accepted' ? firstResult : null
      });
      setTestCaseTab('output');
    } catch (err) {
      setRunResult({
        verdict: 'Compiler Error',
        results: [{ verdict: 'Compilation Error', compile_output: err.message }]
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Run all test cases, submit and save to MongoDB
  const handleSubmitCode = async () => {
    if (!isAuthenticated) {
      alert('You need to be logged in to submit code.');
      navigate('/login');
      return;
    }

    setIsRunning(true);
    setTestCaseTab('console');
    setRunResult(null);

    try {
      const response = await fetch(`/user/solutions/${titleSlug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          username: user.username,
          language,
          sourceCode: solution
        })
      });

      if (!response.ok) {
        throw new Error('Submission server error.');
      }

      const data = await response.json();
      setRunResult(data);
      setTestCaseTab('result');

      // Refresh personal submissions in background
      fetchPersonalSubmissions(user._id);
    } catch (err) {
      setRunResult({
        verdict: 'Internal Error',
        results: [{ verdict: 'Internal Error', compile_output: err.message }]
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Resizing mouse handle event listeners
  const startResizing = () => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Constraint width between 25% and 75%
    if (newLeftWidth >= 25 && newLeftWidth <= 75) {
      setLeftWidth(newLeftWidth);
    }
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.userSelect = 'auto';
  };

  // Clean up resizing events
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResizing);
    };
  }, []);

  // Fetch peer solutions when tab toggled
  useEffect(() => {
    if (leftTab === 'solutions') {
      fetchPeerSolutions();
    }
  }, [leftTab]);

  if (loading) {
    return (
      <Loader
        title="Loading Workspace..."
        subtitle={`Fetching coding configurations for problem.`}
      />
    );
  }

  if (error || !problem) {
    return (
      <div className={styles.errorWrapper}>
        <h3>Workspace Loading Failure</h3>
        <p>{error || 'Requested coding problem was not found.'}</p>
        <button onClick={() => navigate('/practice')} className={styles.backBtn}>
          Back to Practice list
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.workspaceWrapper} ${isFullScreen ? styles.fullScreenMode : ''}`}>
      
      {/* Workspace Containers Grid split by Resizer handle */}
      <div className={styles.workspaceBody} ref={containerRef}>
        
        {/* LEFT COLUMN: Problems, Peer Solutions, Personal Submissions */}
        <div className={styles.leftColumnPanel} style={{ width: `${leftWidth}%` }}>
          <div className={styles.leftPanelTabsHeader}>
            <button 
              className={`${styles.leftTabHeaderBtn} ${leftTab === 'description' ? styles.active : ''}`}
              onClick={() => setLeftTab('description')}
            >
              <FiBookOpen size={14} className={styles.tabIcon} />
              Description
            </button>
            <button 
              className={`${styles.leftTabHeaderBtn} ${leftTab === 'solutions' ? styles.active : ''}`}
              onClick={() => setLeftTab('solutions')}
            >
              <FiUsers size={14} className={styles.tabIcon} />
              Solutions
            </button>
            <button 
              className={`${styles.leftTabHeaderBtn} ${leftTab === 'submissions' ? styles.active : ''}`}
              onClick={() => setLeftTab('submissions')}
            >
              <FiFileText size={14} className={styles.tabIcon} />
              Submissions
            </button>
          </div>

          <div className={styles.leftTabBodyContent}>
            {leftTab === 'description' && (
              <ProblemPanel problem={problem} />
            )}

            {leftTab === 'solutions' && (
              <div className={styles.solutionsTabScroll}>
                {solutions.length === 0 ? (
                  <div className={styles.emptyPrompt}>No community solutions posted yet. Be the first to submit!</div>
                ) : (
                  <div className={styles.peerSolutionsContainer}>
                    {solutions.map((sol) => (
                      <div key={sol._id} className={styles.peerSolutionItem}>
                        <div className={styles.peerSolutionHeader} onClick={() => toggleSolution(sol._id)}>
                          <div>
                            <span className={styles.peerLanguage}>{sol.language}</span>
                            <span className={styles.peerAuthor}>by {sol.username}</span>
                          </div>
                          <div className={styles.peerMetaRight}>
                            <span className={styles.peerTimestamp}>{new Date(sol.createdAt).toLocaleDateString()}</span>
                            <IoMdBookmark 
                              className={`${styles.bookmarkIconSol} ${bookmarks.includes(sol._id) ? styles.bookmarked : ''}`} 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookmark(sol);
                              }} 
                            />
                            {activeSolution === sol._id ? <IoIosArrowDown /> : <IoIosArrowUp />}
                          </div>
                        </div>

                        {activeSolution === sol._id && (
                          <div className={styles.peerSolutionBody}>
                            <SyntaxHighlighter language={sol.language} style={okaidia}>
                              {sol.solution}
                            </SyntaxHighlighter>
                            
                            <button className={styles.viewCommentsBtn} onClick={() => fetchComments(sol._id)}>
                              {showComments ? 'Hide Comments' : 'View Comments'}
                            </button>

                            {showComments && comments[sol._id] && (
                              <div className={styles.commentsWorkspace}>
                                {comments[sol._id].map(comment => (
                                  <div key={comment._id} className={styles.commentBlock}>
                                    <p className={styles.commentTxtContent}>{comment.content}</p>
                                    <div className={styles.commentAuthorBar}>
                                      <span>{comment.username}</span>
                                      <span>•</span>
                                      <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                ))}

                                <form onSubmit={(e) => {
                                  e.preventDefault();
                                  const text = e.target.elements.comment.value;
                                  if (text.trim()) {
                                    handlePostComment(sol._id, text);
                                    e.target.elements.comment.value = '';
                                  }
                                }} className={styles.commentForm}>
                                  <input name="comment" placeholder="Add a comment to this solution..." required />
                                  <button type="submit">Post</button>
                                </form>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {leftTab === 'submissions' && (
              <div className={styles.submissionsTabScroll}>
                {!isAuthenticated ? (
                  <div className={styles.emptyPrompt}>Log in to track your personal submission records.</div>
                ) : personalSubmissions.length === 0 ? (
                  <div className={styles.emptyPrompt}>No submissions registered. Execute a code submission to start!</div>
                ) : (
                  <div className={styles.submissionsHistoryList}>
                    {personalSubmissions.map((sub) => (
                      <div key={sub._id} className={styles.submissionHistoryRow}>
                        <div className={styles.subHistoryHeader}>
                          <span className={`${styles.subVerdictLabel} ${styles[(sub.verdict || 'Accepted').toLowerCase().replace(/\s+/g, '')]}`}>
                            {sub.verdict || 'Accepted'}
                          </span>
                          <span className={styles.subLangLabel}>{sub.language}</span>
                        </div>
                        <div className={styles.subHistoryMeta}>
                          <span>Runtime: <strong>{sub.runtime || '0 ms'}</strong></span>
                          <span>•</span>
                          <span>Memory: <strong>{sub.memory || '0 MB'}</strong></span>
                          <span>•</span>
                          <span>{new Date(sub.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MID SLIDER: DRAGGABLE RESIZER HANDLE */}
        <div className={styles.panelResizer} onMouseDown={startResizing} />

        {/* RIGHT COLUMN: Code Editor, Language select, run controls, Console */}
        <div className={styles.rightColumnPanel} style={{ width: `${100 - leftWidth}%` }}>
          
          {/* Editor Header Toolbar */}
          <div className={styles.editorToolbar}>
            <div className={styles.toolbarLeft}>
              <select 
                className={styles.languageDropdown} 
                value={language} 
                onChange={handleLanguageChange}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
              </select>

              <button className={styles.resetBtn} onClick={handleResetCode} title="Reset starter code">
                <FiRefreshCw size={14} />
              </button>
              <button className={styles.copyBtn} onClick={handleCopyCode} title="Copy all code">
                <FiCopy size={14} />
              </button>
            </div>

            <div className={styles.toolbarRight}>
              <div className={styles.fontSizeControls}>
                <button onClick={() => setFontSize(Math.max(10, fontSize - 1))} title="Decrease Font">A-</button>
                <span className={styles.fontSizeLabel}>{fontSize}px</span>
                <button onClick={() => setFontSize(Math.min(24, fontSize + 1))} title="Increase Font">A+</button>
              </div>

              <select 
                className={styles.themeDropdown} 
                value={editorTheme} 
                onChange={(e) => setEditorTheme(e.target.value)}
                title="Editor Theme"
              >
                <option value="vs-dark">Dark Theme</option>
                <option value="light">Light Theme</option>
              </select>

              <button 
                className={styles.fullscreenBtn} 
                onClick={() => setIsFullScreen(!isFullScreen)}
                title={isFullScreen ? 'Minimize Window' : 'Full Screen'}
              >
                {isFullScreen ? <FiMinimize size={14} /> : <FiMaximize size={14} />}
              </button>
            </div>
          </div>

          {/* Monaco Editor Canvas */}
          <div className={styles.editorCanvasContainer}>
            <MonacoEditorComponent
              language={language}
              code={solution}
              onChange={(val) => setSolution(val)}
              theme={editorTheme}
              fontSize={fontSize}
            />
          </div>

          {/* Controls Bar */}
          <div className={styles.runControlsBar}>
            <div className={styles.runControlsLeft}>
              <button 
                className={`${styles.consoleToggleBtn} ${testCaseTab !== '' ? styles.active : ''}`}
                onClick={() => setTestCaseTab(prev => (prev === '' ? 'testcases' : ''))}
              >
                Console panel
              </button>
            </div>
            <div className={styles.runControlsRight}>
              <button 
                className={styles.runCodeBtn} 
                onClick={handleRunCode} 
                disabled={isRunning}
              >
                <FiPlay size={12} style={{ marginRight: '6px' }} />
                Run Code
              </button>
              <button 
                className={styles.submitBtn} 
                onClick={handleSubmitCode} 
                disabled={isRunning}
              >
                <FiCheck size={14} style={{ marginRight: '6px' }} />
                Submit
              </button>
            </div>
          </div>

          {/* Collapsible Testcase and Output Panel */}
          {testCaseTab !== '' && (
            <div className={styles.consolePanelContainer}>
              <TestCasePanel
                sampleTestCases={problem.sampleTestCases || []}
                customInputs={customInputs}
                setCustomInputs={setCustomInputs}
                activeTab={testCaseTab}
                setActiveTab={setTestCaseTab}
                runResult={runResult}
                isRunning={isRunning}
                selectedCaseIndex={selectedCaseIndex}
                setSelectedCaseIndex={setSelectedCaseIndex}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProblemStatement;