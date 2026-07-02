import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiTag, FiCpu, FiAward } from 'react-icons/fi';
import styles from '../ProblemStatement.module.css';

const ProblemPanel = ({ problem }) => {
  const [expandedHints, setExpandedHints] = useState({});

  const toggleHint = (index) => {
    setExpandedHints(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className={styles.problemPanel}>
      <div className={styles.panelHeader}>
        <span className={styles.breadcrumbLink}>Practice</span>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbActive}>{problem.title}</span>
      </div>

      <div className={styles.panelContent}>
        {/* Title */}
        <h1 className={styles.problemTitle}>{problem.title}</h1>

        {/* Badge Metadata Bar */}
        <div className={styles.metaRow}>
          <span className={`${styles.diffBadge} ${styles[problem.difficulty.toLowerCase()]}`}>
            {problem.difficulty}
          </span>
          <span className={styles.metaStat}>
            <FiAward size={14} className={styles.metaIcon} />
            Acceptance Rate: <strong>{problem.acceptanceRate}%</strong>
          </span>
          {problem.category && (
            <span className={styles.metaStat}>
              <FiCpu size={14} className={styles.metaIcon} />
              Category: <strong>{problem.category}</strong>
            </span>
          )}
        </div>

        {/* Description */}
        <div 
          className={styles.descriptionSection} 
          dangerouslySetInnerHTML={{ __html: problem.description }} 
        />

        {/* Examples */}
        {problem.examples && problem.examples.length > 0 && (
          <div className={styles.sectionContainer}>
            <h3 className={styles.sectionHeader}>Examples</h3>
            {problem.examples.map((example) => (
              <div key={example.id || example._id} className={styles.exampleBlock}>
                <p className={styles.exampleTitle}>Example {example.id}:</p>
                <div className={styles.exampleCodeBox}>
                  <div><strong>Input:</strong> {example.inputText}</div>
                  <div><strong>Output:</strong> {example.outputText}</div>
                  {example.explanation && (
                    <div className={styles.exampleExplanation}>
                      <strong>Explanation:</strong> {example.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Constraints */}
        {problem.constraints && problem.constraints.length > 0 && (
          <div className={styles.sectionContainer}>
            <h3 className={styles.sectionHeader}>Constraints</h3>
            <ul className={styles.constraintsList}>
              {problem.constraints.map((constraint, idx) => (
                <li key={idx} className={styles.constraintItem}>
                  <code>{constraint}</code>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Topic Tags */}
        {problem.topicTags && problem.topicTags.length > 0 && (
          <div className={styles.sectionContainer}>
            <h3 className={styles.sectionHeader}>
              <FiTag className={styles.sectionHeaderIcon} />
              Related Topics
            </h3>
            <div className={styles.topicTagsContainer}>
              {problem.topicTags.map((tag, idx) => (
                <span key={idx} className={styles.topicTagPill}>
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Hints */}
        {problem.hints && problem.hints.length > 0 && (
          <div className={styles.sectionContainer}>
            <h3 className={styles.sectionHeader}>Hints</h3>
            <div className={styles.hintsWrapper}>
              {problem.hints.map((hint, idx) => {
                const isOpen = expandedHints[idx];
                return (
                  <div key={idx} className={styles.hintAccordion}>
                    <div 
                      className={styles.hintHeader} 
                      onClick={() => toggleHint(idx)}
                    >
                      <span>Hint {idx + 1}</span>
                      {isOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                    </div>
                    {isOpen && (
                      <div className={styles.hintBody}>
                        {hint}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Companies */}
        {problem.companies && problem.companies.length > 0 && (
          <div className={styles.sectionContainer}>
            <h3 className={styles.sectionHeader}>Companies</h3>
            <div className={styles.companiesList}>
              {problem.companies.map((company, idx) => (
                <span key={idx} className={styles.companyPill}>
                  {company}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemPanel;
