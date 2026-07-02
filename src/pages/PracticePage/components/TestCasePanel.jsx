import React, { useState } from 'react';
import { FiPlay, FiPlus, FiTrash2, FiTerminal, FiLayers, FiFileText } from 'react-icons/fi';
import styles from '../ProblemStatement.module.css';

const TestCasePanel = ({ 
  sampleTestCases = [], 
  customInputs = [], 
  setCustomInputs,
  activeTab, 
  setActiveTab, 
  runResult, 
  isRunning,
  selectedCaseIndex,
  setSelectedCaseIndex
}) => {
  const [customInputText, setCustomInputText] = useState('');

  // Synchronize input text when active case changes
  React.useEffect(() => {
    if (customInputs[selectedCaseIndex] !== undefined) {
      setCustomInputText(customInputs[selectedCaseIndex]);
    } else {
      setCustomInputText('');
    }
  }, [selectedCaseIndex, customInputs]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setCustomInputText(val);
    
    // Update parent state
    const nextInputs = [...customInputs];
    nextInputs[selectedCaseIndex] = val;
    setCustomInputs(nextInputs);
  };

  const addCustomCase = () => {
    const nextInputs = [...customInputs, ''];
    setCustomInputs(nextInputs);
    setSelectedCaseIndex(nextInputs.length - 1);
  };

  const deleteCustomCase = (indexToDelete) => {
    if (customInputs.length <= 1) return; // keep at least one case
    
    const nextInputs = customInputs.filter((_, idx) => idx !== indexToDelete);
    setCustomInputs(nextInputs);
    
    // Adjust selected index
    if (selectedCaseIndex >= nextInputs.length) {
      setSelectedCaseIndex(nextInputs.length - 1);
    }
  };

  // Get run results for current selected case
  const currentResult = runResult && runResult.results && runResult.results[selectedCaseIndex] 
    ? runResult.results[selectedCaseIndex] 
    : (runResult && runResult.results && runResult.results[0] ? runResult.results[0] : null);

  return (
    <div className={styles.testCasePanel}>
      {/* 1. Tabs Header Selector */}
      <div className={styles.panelTabsHeader}>
        <div className={styles.tabButtonsGroup}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'testcases' ? styles.active : ''}`}
            onClick={() => setActiveTab('testcases')}
          >
            <FiLayers size={14} className={styles.tabIcon} />
            Testcases
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'console' ? styles.active : ''}`}
            onClick={() => setActiveTab('console')}
          >
            <FiTerminal size={14} className={styles.tabIcon} />
            Console
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'output' ? styles.active : ''}`}
            onClick={() => setActiveTab('output')}
          >
            <FiFileText size={14} className={styles.tabIcon} />
            Output
          </button>
          {runResult && (
            <button 
              className={`${styles.tabBtn} ${activeTab === 'result' ? styles.active : ''}`}
              onClick={() => setActiveTab('result')}
            >
              Result
            </button>
          )}
        </div>
      </div>

      {/* 2. Tab Content Panel */}
      <div className={styles.tabBodyContent}>
        {/* TAB 1: TESTCASES (Inputs Management) */}
        {activeTab === 'testcases' && (
          <div className={styles.testcasesTabContent}>
            <div className={styles.caseSelectorsRow}>
              {customInputs.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`${styles.casePill} ${selectedCaseIndex === idx ? styles.active : ''}`}
                  onClick={() => setSelectedCaseIndex(idx)}
                >
                  <span>Case {idx + 1}</span>
                  {customInputs.length > 1 && (
                    <FiTrash2 
                      className={styles.deleteCaseIcon} 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCustomCase(idx);
                      }}
                      title="Delete Test Case"
                    />
                  )}
                </div>
              ))}
              <button className={styles.addCaseBtn} onClick={addCustomCase}>
                <FiPlus size={14} />
                Add Case
              </button>
            </div>

            <div className={styles.inputAreaContainer}>
              <label className={styles.inputBoxLabel}>Input:</label>
              <textarea 
                className={styles.testcaseTextarea}
                value={customInputText}
                onChange={handleInputChange}
                placeholder="Enter custom stdin testcase parameters here..."
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {/* TAB 2: CONSOLE (Compilation & Stderr Logs) */}
        {activeTab === 'console' && (
          <div className={styles.consoleTabContent}>
            {isRunning ? (
              <div className={styles.consoleStatusText}>Compiling and running code...</div>
            ) : currentResult ? (
              <div className={styles.logsBox}>
                {currentResult.compile_output ? (
                  <div className={styles.compileLogBlock}>
                    <p className={styles.logLabelError}>Compilation Logs:</p>
                    <pre className={styles.stderrText}>{currentResult.compile_output}</pre>
                  </div>
                ) : currentResult.stderr ? (
                  <div className={styles.runtimeLogBlock}>
                    <p className={styles.logLabelError}>Stderr:</p>
                    <pre className={styles.stderrText}>{currentResult.stderr}</pre>
                  </div>
                ) : (
                  <div className={styles.successConsoleMsg}>
                    ✔ Code compiled successfully with no compilation errors or stderr messages.
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.emptyConsolePrompt}>
                Run your code to view compiler and standard error logs here.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: OUTPUT (Stdout vs Expected Outputs) */}
        {activeTab === 'output' && (
          <div className={styles.outputTabContent}>
            {isRunning ? (
              <div className={styles.consoleStatusText}>Waiting for output...</div>
            ) : currentResult ? (
              <div className={styles.outputSplitBox}>
                <div className={styles.outputFieldBlock}>
                  <label className={styles.ioLabel}>Your Output:</label>
                  <pre className={styles.stdoutText}>{currentResult.stdout || 'No standard output.'}</pre>
                </div>
                {currentResult.expected_output && (
                  <div className={styles.outputFieldBlock}>
                    <label className={styles.ioLabel}>Expected Output:</label>
                    <pre className={styles.expectedText}>{currentResult.expected_output}</pre>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.emptyConsolePrompt}>
                Execute code to view terminal output streams here.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: RESULT (Verdict display) */}
        {activeTab === 'result' && runResult && (
          <div className={styles.resultTabContent}>
            {isRunning ? (
              <div className={styles.consoleStatusText}>Checking final submission verdict...</div>
            ) : (
              <div className={styles.resultDetailsCard}>
                <div className={`${styles.verdictHeaderBox} ${styles[runResult.verdict.toLowerCase().replace(/\s+/g, '')]}`}>
                  <span className={styles.verdictTitle}>{runResult.verdict}</span>
                  {runResult.runtime && (
                    <span className={styles.performanceMetric}>Runtime: <strong>{runResult.runtime}</strong></span>
                  )}
                  {runResult.memory && (
                    <span className={styles.performanceMetric}>Memory: <strong>{runResult.memory}</strong></span>
                  )}
                </div>

                {runResult.failedTestcase && (
                  <div className={styles.failedTestcaseDetails}>
                    <p className={styles.failedHeader}>Failed Test Case Input:</p>
                    <pre className={styles.failedCodeBlock}>{runResult.failedTestcase.input}</pre>
                    
                    <div className={styles.failedOutputsBox}>
                      <div>
                        <p className={styles.failedHeader}>Expected Output:</p>
                        <pre className={styles.failedExpected}>{runResult.failedTestcase.expected_output}</pre>
                      </div>
                      <div>
                        <p className={styles.failedHeader}>Your Output:</p>
                        <pre className={styles.failedActual}>{runResult.failedTestcase.stdout || '(Empty Output)'}</pre>
                      </div>
                    </div>

                    {runResult.failedTestcase.stderr && (
                      <div className={styles.failedRuntimeError}>
                        <p className={styles.failedHeader}>Runtime Error Message:</p>
                        <pre className={styles.failedErrorBox}>{runResult.failedTestcase.stderr}</pre>
                      </div>
                    )}
                  </div>
                )}

                {!runResult.failedTestcase && runResult.verdict === 'Accepted' && (
                  <div className={styles.successVerdictPanel}>
                    🎉 All test cases passed successfully! Feel free to save this solution or view peer code solutions.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCasePanel;
