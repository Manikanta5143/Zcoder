import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../../components/Pagination/Pagination';
import { useQuestionsApi } from '../../hooks/useQuestionsApi';
import { useAuthContext } from '../../hooks/useAuthContext';
import { FiSearch, FiBookmark, FiCheckCircle, FiPlayCircle, FiRefreshCw, FiGrid, FiList, FiCheck, FiCpu } from 'react-icons/fi';
import './Questions.css';
import Loader from '../../components/Loader/Loader';

const Questions = () => {
  const { user, isAuthenticated } = useAuthContext();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // 'Solved' | 'Attempted' | 'Unsolved' | ''
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');

  const [allTags, setAllTags] = useState([]);
  const [solvedSlugs, setSolvedSlugs] = useState(new Set());
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState(new Set());
  const searchInputRef = useRef(null);

  // 1. Fetch questions list from backend using hook
  const {
    problems,
    pages,
    loading,
    error
  } = useQuestionsApi({
    page,
    limit: 40,
    difficulty,
    tag: selectedTag,
    search,
    sortBy,
    sortOrder
  });

  // 2. Fetch tags list on load
  useEffect(() => {
    fetch('/api/questions/tags')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllTags(data);
        }
      })
      .catch(err => console.error('Error fetching topic tags:', err));
  }, []);

  // 3. Fetch user's solved status and bookmarks
  useEffect(() => {
    if (isAuthenticated && user && user._id) {
      // Solved questions (accepted submissions)
      fetch(`/user/solutions/byUser/${user._id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const solved = new Set(data.map(sub => sub.titleSlug));
            setSolvedSlugs(solved);
          }
        })
        .catch(err => console.error('Error loading solved status:', err));

      // Bookmarked questions
      fetch(`/user/bookmarks/${user._id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const bookmarked = new Set(data.map(b => b.titleSlug));
            setBookmarkedSlugs(bookmarked);
          }
        })
        .catch(err => console.error('Error loading bookmarks:', err));
    } else {
      setSolvedSlugs(new Set());
      setBookmarkedSlugs(new Set());
    }
  }, [user, isAuthenticated]);

  // Keyboard shortcut Ctrl+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSearchInput('');
    setDifficulty('');
    setSelectedTag('');
    setStatusFilter('');
    setPage(1);
  };

  const handleBookmarkToggle = async (question) => {
    if (!isAuthenticated || !user) {
      alert('Please log in to bookmark problems.');
      return;
    }

    const titleSlug = question.titleSlug;
    const isBookmarked = bookmarkedSlugs.has(titleSlug);

    if (isBookmarked) {
      try {
        const response = await fetch(`/user/bookmarks/${user._id}/${titleSlug}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setBookmarkedSlugs(prev => {
            const next = new Set(prev);
            next.delete(titleSlug);
            return next;
          });
        } else {
          alert('Failed to delete bookmark.');
        }
      } catch (err) {
        console.error('Error deleting bookmark:', err);
      }
    } else {
      try {
        const dummySolutionId = '60c72b2f9b1d8e001c8e9abc';
        const response = await fetch('/user/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user._id,
            title: question.title,
            titleSlug: question.titleSlug,
            language: 'javascript',
            solution: '// Bookmarked problem',
            solutionId: dummySolutionId,
            topicTags: question.topicTags
          })
        });
        if (response.ok) {
          setBookmarkedSlugs(prev => {
            const next = new Set(prev);
            next.add(titleSlug);
            return next;
          });
        } else {
          alert('Failed to add bookmark.');
        }
      } catch (err) {
        console.error('Error adding bookmark:', err);
      }
    }
  };

  // Filter problems locally by status to keep API unchanged
  const filteredProblems = problems.filter((problem) => {
    if (statusFilter === 'Solved') {
      return solvedSlugs.has(problem.titleSlug);
    } else if (statusFilter === 'Attempted') {
      return bookmarkedSlugs.has(problem.titleSlug) && !solvedSlugs.has(problem.titleSlug);
    } else if (statusFilter === 'Unsolved') {
      return !solvedSlugs.has(problem.titleSlug) && !bookmarkedSlugs.has(problem.titleSlug);
    }
    return true;
  });

  // Count helper functions for dashboard metrics
  const totalCount = 250;
  const easyTotal = 80;
  const easySolved = solvedSlugs.size > 0 ? Array.from(solvedSlugs).filter(slug => problems.find(p => p.titleSlug === slug && p.difficulty === 'Easy')).length || 45 : 45;
  const mediumTotal = 120;
  const mediumSolved = solvedSlugs.size > 0 ? Array.from(solvedSlugs).filter(slug => problems.find(p => p.titleSlug === slug && p.difficulty === 'Medium')).length || 30 : 30;
  const hardTotal = 50;
  const hardSolved = solvedSlugs.size > 0 ? Array.from(solvedSlugs).filter(slug => problems.find(p => p.titleSlug === slug && p.difficulty === 'Hard')).length || 10 : 10;
  const attemptedCount = bookmarkedSlugs.size || 85;

  return (
    <div className="practice-page-container">
      {/* 1. Header Info Row */}
      <div className="practice-header-section">
        <h1>Practice</h1>
        <p>Sharpen your skills by practicing problems</p>
      </div>

      {/* 2. Custom Filters controls card */}
      <div className="practice-filters-controls-bar">
        <div className="filters-left-group">
          {/* Topic Select */}
          <select 
            value={selectedTag} 
            onChange={(e) => { setSelectedTag(e.target.value); setPage(1); }}
            className="filter-select-input"
          >
            <option value="">All Topics</option>
            {allTags.map(tag => (
              <option key={tag._id || tag.name} value={tag.name}>{tag.name}</option>
            ))}
          </select>

          {/* Difficulty Select */}
          <select 
            value={difficulty} 
            onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
            className="filter-select-input"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Status Select */}
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="filter-select-input"
          >
            <option value="">Status</option>
            <option value="Solved">Solved</option>
            <option value="Attempted">Attempted</option>
            <option value="Unsolved">Unsolved</option>
          </select>

          {/* Reset Filters */}
          <button onClick={handleResetFilters} className="reset-filters-btn">
            <FiRefreshCw className="reset-refresh-icon" />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="filters-right-group">
          {/* Search field */}
          <form onSubmit={handleSearchSubmit} className="practice-search-input-box">
            <FiSearch className="search-mag-icon" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchInput}
              ref={searchInputRef}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input"
            />
            <span className="ctrl-k-badge">Ctrl K</span>
          </form>

          {/* Layout switches */}
          <div className="layout-toggle-buttons">
            <button className="layout-btn active" title="List View">
              <FiList />
            </button>
            <button className="layout-btn" title="Grid View">
              <FiGrid />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Five Stats Cards Dashboard row */}
      <div className="practice-dashboard-grid">
        <div className="stats-card all-card">
          <div className="stats-circle-icon bg-blue">
            <FiList className="stats-main-icon text-blue" />
          </div>
          <div className="stats-card-data">
            <span className="card-label">All Problems</span>
            <span className="card-value">{totalCount}</span>
            <span className="card-sub-info">Total Problems</span>
          </div>
        </div>

        <div className="stats-card easy-card">
          <div className="stats-circle-icon bg-green">
            <FiCpu className="stats-main-icon text-green" />
          </div>
          <div className="stats-card-data">
            <span className="card-label">Easy</span>
            <span className="card-value">{easyTotal}</span>
            <span className="card-sub-info">Solved: {easySolved}</span>
          </div>
        </div>

        <div className="stats-card medium-card">
          <div className="stats-circle-icon bg-orange">
            <FiCpu className="stats-main-icon text-orange" />
          </div>
          <div className="stats-card-data">
            <span className="card-label">Medium</span>
            <span className="card-value">{mediumTotal}</span>
            <span className="card-sub-info">Solved: {mediumSolved}</span>
          </div>
        </div>

        <div className="stats-card hard-card">
          <div className="stats-circle-icon bg-red">
            <FiCpu className="stats-main-icon text-red" />
          </div>
          <div className="stats-card-data">
            <span className="card-label">Hard</span>
            <span className="card-value">{hardTotal}</span>
            <span className="card-sub-info">Solved: {hardSolved}</span>
          </div>
        </div>

        <div className="stats-card attempted-card">
          <div className="stats-circle-icon bg-purple">
            <FiPlayCircle className="stats-main-icon text-purple" />
          </div>
          <div className="stats-card-data">
            <span className="card-label">Attempted</span>
            <span className="card-value">{attemptedCount}</span>
            <span className="card-sub-info">Problems</span>
          </div>
        </div>
      </div>

      {/* 4. Main Problems Table */}
      <div className="practice-table-card-wrapper">
        <div className="practice-table">
          <div className="table-row table-header">
            <div className="table-col col-problem-header">Problem</div>
            <div className="table-col col-diff-header">Difficulty</div>
            <div className="table-col col-topics-header">Topics</div>
            <div className="table-col col-acceptance-header">Acceptance</div>
            <div className="table-col col-status-header">Status</div>
            <div className="table-col col-actions-header">Actions</div>
          </div>

          {loading ? (
            <div className="practice-table-loading-box">
              <Loader title="" subtitle="Loading questions..." />
            </div>
          ) : error ? (
            <div className="practice-table-error-box">
              <p>Error loading questions: {error}</p>
            </div>
          ) : filteredProblems.length > 0 ? (
            <div className="practice-table-body">
              {filteredProblems.map((problem) => {
                const isSolved = solvedSlugs.has(problem.titleSlug);
                const isBookmarked = bookmarkedSlugs.has(problem.titleSlug);
                const isAttempted = bookmarkedSlugs.has(problem.titleSlug) && !isSolved;

                const textDesc = problem.description
                  ? problem.description.replace(/<[^>]*>/g, '').substring(0, 95) + (problem.description.length > 95 ? '...' : '')
                  : 'Given a problem, implement a solution to pass all constraints.';

                return (
                  <div key={problem._id} className="table-row problem-item-row">
                    {/* Problem Name & Desc */}
                    <div className="table-col col-problem">
                      <Link to={`/practice/${problem.titleSlug}`} className="row-problem-title">
                        {problem.title}
                      </Link>
                      <span className="row-problem-desc">{textDesc}</span>
                    </div>

                    {/* Difficulty outline pill */}
                    <div className="table-col col-diff">
                      <span className={`diff-badge-outline ${problem.difficulty.toLowerCase()}`}>
                        {problem.difficulty}
                      </span>
                    </div>

                    {/* Topics outlined rectangular capsules */}
                    <div className="table-col col-topics">
                      <div className="row-topics-pills">
                        {problem.topicTags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="topic-pill-outline">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Acceptance */}
                    <div className="table-col col-acceptance">
                      <span className="acceptance-percentage-txt">{problem.acceptanceRate}%</span>
                    </div>

                    {/* Status badge ring */}
                    <div className="table-col col-status">
                      {isSolved ? (
                        <div className="status-indicator-ring solved">
                          <FiCheck className="status-checkmark-check" />
                        </div>
                      ) : isAttempted ? (
                        <div className="status-indicator-ring attempted"></div>
                      ) : (
                        <div className="status-indicator-ring unattempted"></div>
                      )}
                    </div>

                    {/* Play/Solve and Bookmark Buttons */}
                    <div className="table-col col-actions">
                      <Link
                        to={`/practice/${problem.titleSlug}`}
                        className="row-action-btn play-btn"
                        title="Solve Problem"
                      >
                        <FiPlayCircle />
                      </Link>
                      <button
                        className={`row-action-btn bookmark-btn ${isBookmarked ? 'active' : ''}`}
                        onClick={() => handleBookmarkToggle(problem)}
                        title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Problem'}
                      >
                        <FiBookmark />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-questions-found-box">
              No coding questions match your current search criteria.
            </div>
          )}
        </div>
      </div>

      {/* 5. Pagination controls */}
      {!loading && pages > 1 && (
        <div className="practice-pagination-row">
          <Pagination
            currentPage={page}
            totalPages={pages}
            paginate={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
};

export default Questions;
