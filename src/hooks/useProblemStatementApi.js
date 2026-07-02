import { useState, useEffect } from 'react';

/**
 * Custom hook for managing problem statement API calls
 * Fetches from internal questions API and maps properties for compatibility
 * @param {string} titleSlug - The problem's title slug
 * @returns {Object} - State for problem statement API
 */
export const useProblemStatementApi = (titleSlug) => {
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!titleSlug) return;

    setLoading(true);
    setError(null);

    const fetchProblemStatement = async () => {
      try {
        const response = await fetch(`/api/questions/${titleSlug}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Map backend schema to the expected frontend schema
        const mappedProblem = {
          ...data,
          questionTitle: data.title,
          question: data.description,
          hints: Array.isArray(data.hints) ? data.hints : [],
          topicTags: data.topicTags || []
        };
        
        setProblem(mappedProblem);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProblemStatement();
  }, [titleSlug]);

  return {
    problem,
    loading,
    error
  };
};