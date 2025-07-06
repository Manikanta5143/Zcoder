import { useState, useEffect } from 'react';

/**
 * Custom hook for managing questions API calls
 * @returns {Object} - State for questions API
 */
export const useQuestionsApi = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchProblems = async () => {
      try {
        const response = await fetch('https://alfa-leetcode-api.onrender.com/problems?limit=20');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setProblems(data.problemsetQuestionList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  return {
    problems,
    loading,
    error
  };
}; 