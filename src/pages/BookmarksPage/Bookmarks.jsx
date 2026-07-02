import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';
import { FiBookmark, FiTag, FiEye, FiTrash2, FiCalendar, FiSliders, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Bookmarks.css';
import Loader from '../../components/Loader/Loader';

const Bookmarks = () => {
  const navigate = useNavigate();
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState([]);
  const [redirectLoading, setRedirectLoading] = useState(false);
  const [questionsPerPage, setQuestionsPerPage] = useState(10);
  const { user, isAuthenticated } = useAuthContext();
  const [message, setMessage] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Frontend question metadata map
  const [questionsMap, setQuestionsMap] = useState({});

  useEffect(() => {
    if (isAuthenticated && user && user._id) {
      fetchBookmarkedQuestions(user._id);
      fetchQuestionsData();
    } else {
      if (!message) {
        setMessage('You need to be logged in to view this page.');
        setRedirectLoading(true);
        
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    }
  }, [user, isAuthenticated]);

  const fetchQuestionsData = async () => {
    try {
      const res = await fetch('/api/questions?limit=500');
      if (res.ok) {
        const data = await res.json();
        const qList = data.questions || [];
        const qMap = {};
        qList.forEach(q => {
          qMap[q.titleSlug] = {
            difficulty: q.difficulty,
            description: q.description || ''
          };
        });
        setQuestionsMap(qMap);
      }
    } catch (err) {
      console.error('Error fetching questions map:', err);
    }
  };

  const fetchBookmarkedQuestions = async (userId) => {
    try {
      const response = await fetch(`/user/bookmarks/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setBookmarkedQuestions(data);
      } else {
        console.error('Failed to fetch bookmarked questions');
      }
    } catch (error) {
      console.error('Error fetching bookmarked questions', error);
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;

  const filteredQuestions = bookmarkedQuestions.filter(question =>
    selectedTags.length === 0 ||
    question.topicTags.some(tag => selectedTags.includes(tag.name))
  );

  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const allTags = [...new Set(bookmarkedQuestions.flatMap(question => question.topicTags.map(tag => tag.name)))];

  const handleTagChange = (tag) => {
    setSelectedTags(prevSelectedTags =>
      prevSelectedTags.includes(tag)
        ? prevSelectedTags.filter(t => t !== tag)
        : [...prevSelectedTags, tag]
    );
    setCurrentPage(1);
  };

  const handleDeleteBookmark = async (titleSlug) => {
    setItemToDelete({ titleSlug, type: 'bookmark' });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      const response = await fetch(`/user/bookmarks/${user._id}/${itemToDelete.titleSlug}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setBookmarkedQuestions(prevBookmarks => 
          prevBookmarks.filter(bookmark => bookmark.titleSlug !== itemToDelete.titleSlug)
        );
        alert('Bookmark deleted successfully');
      } else {
        alert('Failed to delete bookmark');
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      alert('Error deleting bookmark');
    } finally {
      setShowDeleteDialog(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  if (redirectLoading) {
    return (
      <Loader
        title="Login to view this page"
        subtitle="Please wait while we take you to the login page."
      />
    );
  }

  if (message) {
    return <div className='loading-screen'>Login to view this page</div>;
  }

  if (loading && !message) {
    return <div className='loading-screen'>Loading...</div>;
  }

  if (error) {
    return <div className='error-screen'>{error}</div>;
  }

  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  return (
    <div className="bookmarks-page-container">
      {/* 1. Breadcrumbs & Header */}
      <div className="bookmarks-header-section">
        <div className="header-left">
          <div className="bookmark-icon-box">
            <FiBookmark className="bookmark-header-icon" />
          </div>
          <div className="title-stack">
            <h1>My Bookmarks</h1>
            <p>Your saved problems to revise and solve later</p>
          </div>
        </div>
        <div className="header-right">
          <span className="bookmarks-breadcrumbs">
            Dashboard <span className="caret">&gt;</span> <span className="current">Bookmarks</span>
          </span>
        </div>
      </div>

      {/* 2. Statistics Dashboard Cards */}
      <div className="bookmarks-dashboard-row">
        <div className="stats-card bookmark-card">
          <div className="stats-icon-box bookmark-bg">
            <FiBookmark className="stats-icon text-blue" />
          </div>
          <div className="stats-info">
            <span className="stats-label">Total Bookmarks</span>
            <span className="stats-value">{bookmarkedQuestions.length}</span>
            <span className="stats-sub">Problems saved</span>
          </div>
        </div>

        <div className="stats-card topic-card">
          <div className="stats-icon-box topic-bg">
            <FiTag className="stats-icon text-green" />
          </div>
          <div className="stats-info">
            <span className="stats-label">Topics Covered</span>
            <span className="stats-value">{allTags.length}</span>
            <span className="stats-sub">Different topics</span>
          </div>
        </div>

        <div className="stats-card results-card">
          <div className="stats-icon-box results-bg">
            <FiEye className="stats-icon text-teal" />
          </div>
          <div className="stats-info">
            <span className="stats-label">Showing Results</span>
            <span className="stats-value">
              {filteredQuestions.length === 0 ? '0' : `${indexOfFirstQuestion + 1}-${Math.min(indexOfLastQuestion, filteredQuestions.length)}`}
            </span>
            <span className="stats-sub">of {bookmarkedQuestions.length} bookmarks</span>
          </div>
        </div>
      </div>

      {/* 3. Tag Filter Pill row */}
      <div className="bookmarks-filter-pills-row">
        <div className="pills-scroll-container">
          <button
            className={`filter-pill-btn ${selectedTags.length === 0 ? 'active' : ''}`}
            onClick={() => { setSelectedTags([]); setCurrentPage(1); }}
          >
            All Topics
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`filter-pill-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
              onClick={() => handleTagChange(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        <button className="settings-filter-btn">
          <FiSliders className="settings-icon" />
          <span>Filters</span>
        </button>
      </div>

      {/* 4. Main Table */}
      <div className="bookmarks-table-wrapper">
        <div className="bookmarks-table">
          <div className="table-row table-header">
            <div className="table-col col-date-header">
              <span>Date Saved</span>
              <span className="sort-arrows">⇅</span>
            </div>
            <div className="table-col col-problem-header">
              <span>Problem</span>
              <span className="sort-arrows">⇅</span>
            </div>
            <div className="table-col col-diff-header">
              <span>Difficulty</span>
              <span className="sort-arrows">⇅</span>
            </div>
            <div className="table-col col-tags-header">
              <span>Tags</span>
              <span className="sort-arrows">⇅</span>
            </div>
            <div className="table-col col-actions-header">Actions</div>
          </div>

          {currentQuestions.length === 0 ? (
            <div className="bookmarks-empty-state">
              <div className="empty-icon-box">
                <FiBookmark className="empty-icon" />
              </div>
              <h3>No Bookmarks Yet</h3>
              <p>You haven't bookmarked any coding problems. Browse the Practice page to save problems to solve later.</p>
              <Link to="/practice" className="explore-problems-btn">
                Browse Practice Problems
              </Link>
            </div>
          ) : (
            currentQuestions.map((question) => {
              const qInfo = questionsMap[question.titleSlug] || {
                difficulty: 'Easy',
                description: 'Given a problem, implement a solution to pass all constraints.'
              };
              
              const dateObj = new Date(question.createdAt);
              const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

              return (
                <div key={question._id} className="table-row problem-item-row">
                  {/* Date Saved */}
                  <div className="table-col col-date">
                    <FiCalendar className="row-calendar-icon" />
                    <div className="date-vertical-stack">
                      <span className="main-date-txt">{dateStr}</span>
                      <span className="sub-time-txt">{timeStr}</span>
                    </div>
                  </div>

                  {/* Problem Name & Description */}
                  <div className="table-col col-problem">
                    <Link to={`/bookmarks/${question.titleSlug}`} className="row-problem-title">
                      {question.title}
                    </Link>
                    <span className="row-problem-desc">
                      {qInfo.description.replace(/<[^>]*>/g, '').substring(0, 90) + (qInfo.description.length > 90 ? '...' : '')}
                    </span>
                  </div>

                  {/* Difficulty */}
                  <div className="table-col col-diff">
                    <span className={`diff-badge-outline ${qInfo.difficulty.toLowerCase()}`}>
                      {qInfo.difficulty}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="table-col col-tags">
                    <div className="row-tags-list">
                      {question.topicTags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="row-tag-item">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="table-col col-actions">
                    <Link to={`/bookmarks/${question.titleSlug}`} className="action-circle-btn view-btn-circle" title="View Details">
                      <FiEye />
                    </Link>
                    <button
                      className="action-circle-btn delete-btn-circle"
                      onClick={() => handleDeleteBookmark(question.titleSlug)}
                      title="Delete Bookmark"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. Custom Pagination Footer Row */}
      {filteredQuestions.length > 0 && (
        <div className="bookmarks-footer-pagination-bar">
          <div className="pagination-text-info">
            Showing {indexOfFirstQuestion + 1} to {Math.min(indexOfLastQuestion, filteredQuestions.length)} of {filteredQuestions.length} bookmarks
          </div>

          <div className="pagination-controls-pills">
            <button
              className="arrow-pill-btn"
              disabled={currentPage === 1}
              onClick={() => paginate(currentPage - 1)}
            >
              <FiChevronLeft />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`page-pill-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => paginate(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="arrow-pill-btn"
              disabled={currentPage === totalPages}
              onClick={() => paginate(currentPage + 1)}
            >
              <FiChevronRight />
            </button>
          </div>

          <div className="pagination-select-page-size">
            <select
              value={questionsPerPage}
              onChange={(e) => {
                setQuestionsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="page-size-selector"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      )}

      {/* 6. Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title="Delete Bookmark"
        message="Are you sure you want to delete this bookmark? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Bookmarks;