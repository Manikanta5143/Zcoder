import { useState, useEffect } from 'react';

/**
 * Custom hook for managing problem statement API calls
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
        const response = await fetch(`https://alfa-leetcode-api.onrender.com/select?titleSlug=${titleSlug}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setProblem(data);
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