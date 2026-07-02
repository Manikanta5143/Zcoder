import React, { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';
import { FiFileText, FiGrid, FiEye, FiSliders, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import './Submissions.css';
import SubmissionTable from "./components/SubmissionTable";
import Loader from '../../components/Loader/Loader';

const Submissions = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState([]);
  const [questionsPerPage, setQuestionsPerPage] = useState(10);
  const { user, isAuthenticated } = useAuthContext();
  const [message, setMessage] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [redirectLoading, setRedirectLoading] = useState(false);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user && user._id) {
      fetchSubmissions(user._id);
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

  const fetchSubmissions = async (userId) => {
    try {
      const response = await fetch(`/user/solutions/byUser/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      } else {
        console.error('Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions', error);
    } finally {
      setLoading(false);
    }
  };
  
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;

  const filteredQuestions = submissions.filter(question =>
    selectedTags.length === 0 ||
    question.topicTags.some(tag => selectedTags.includes(tag.name))
  );

  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const allTags = [...new Set(submissions.flatMap(question => question.topicTags.map(tag => tag.name)))];
  
  const handleTagChange = (tag) => {
    setSelectedTags(prevSelectedTags =>
      prevSelectedTags.includes(tag)
        ? prevSelectedTags.filter(t => t !== tag)
        : [...prevSelectedTags, tag]
    );
    setCurrentPage(1);
  };

  const handleDeleteSubmission = async (submissionId) => {
    setItemToDelete({ id: submissionId, type: 'submission' });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      const response = await fetch(`/user/solutions/${itemToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSubmissions(prevSubmissions => 
          prevSubmissions.filter(submission => submission._id !== itemToDelete.id)
        );
        alert('Submission deleted successfully');
      } else {
        alert('Failed to delete submission');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Error deleting submission');
    } finally {
      setShowDeleteDialog(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 150, behavior: 'smooth' });
    }
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

  // Group submission counts by titleSlug
  const submissionCounts = {};
  submissions.forEach(sub => {
    submissionCounts[sub.titleSlug] = (submissionCounts[sub.titleSlug] || 0) + 1;
  });

  return (
    <div className="submissions-page-container">
      {/* 1. Page Header with inline Filter Button */}
      <div className="submissions-header-section">
        <div className="header-left">
          <h1>My Submissions</h1>
          <p>Track every solution you've solved and submitted.</p>
        </div>
        <div className="header-right">
          <button className="submissions-header-filter-btn">
            <FiSliders className="settings-icon" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* 2. Three Stat Cards Row */}
      <div className="submissions-dashboard-row">
        <div className="stats-card submissions-total-card">
          <div className="stats-icon-box sub-total-bg">
            <FiFileText className="stats-icon text-blue" />
          </div>
          <div className="stats-info">
            <span className="stats-label">Total Submissions</span>
            <span className="stats-value">{submissions.length}</span>
          </div>
        </div>

        <div className="stats-card submissions-topics-card">
          <div className="stats-icon-box sub-topics-bg">
            <FiGrid className="stats-icon text-green" />
          </div>
          <div className="stats-info">
            <span className="stats-label">Topics Covered</span>
            <span className="stats-value">{allTags.length}</span>
          </div>
        </div>

        <div className="stats-card submissions-results-card">
          <div className="stats-icon-box sub-results-bg">
            <FiEye className="stats-icon text-purple" />
          </div>
          <div className="stats-info">
            <span className="stats-label">Visible Results</span>
            <span className="stats-value">{filteredQuestions.length}</span>
          </div>
        </div>
      </div>
        
      {/* 3. Horizontal Scroll tag filter list */}
      <div className="submissions-filter-pills-row">
        <div className="pills-scroll-container" ref={scrollRef}>
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
        <button className="chevron-scroll-btn" onClick={scrollRight}>
          <FiChevronRight />
        </button>
      </div>

      {/* 4. Submissions Table */}
      {currentQuestions.length === 0 ? (
        <div className="submissions-empty-state">
          <div className="empty-icon-box">
            <FiFileText className="empty-icon" />
          </div>
          <h2>No Submissions Yet</h2>
          <p>Start solving coding problems to build your submission history.</p>
          <Link to="/practice" className="start-solving-btn">
            🚀 Start Solving
          </Link>
        </div>
      ) : (
        <SubmissionTable
          submissions={currentQuestions}
          onDelete={handleDeleteSubmission}
          submissionCounts={submissionCounts}
        />
      )}

      {/* 5. Custom Footer Pagination Bar */}
      {filteredQuestions.length > 0 && (
        <div className="submissions-footer-pagination-bar">
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
        </div>
      )}

      {/* 6. Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title="Delete Submission"
        message="Are you sure you want to delete this submission? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Submissions;