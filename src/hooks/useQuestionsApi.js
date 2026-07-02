import { useState, useEffect } from 'react';

/**
 * Custom hook for managing questions API calls with support for pagination, search, filters, and sorting
 * @param {Object} params - Query parameters (page, limit, difficulty, tag, search, sortBy, sortOrder)
 * @returns {Object} - Hook state and controls
 */
export const useQuestionsApi = (params = {}) => {
  const [problems, setProblems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stringify params to use as a stable dependency for useEffect
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchProblems = async () => {
      try {
        const queryParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            queryParams.append(key, val);
          }
        });

        const response = await fetch(`/api/questions?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setProblems(data.questions || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [paramsKey]);

  return {
    problems,
    total,
    pages,
    loading,
    error
  };
};