import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import TagFilter from '../../components/TagFilter/TagFilter';
import Pagination from '../../components/Pagination/Pagination';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';
import './Bookmarks.css';
import Loader from '../../components/Loader/Loader';

const Bookmarks = () => {
  const navigate = useNavigate()
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
  // const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState([]);
  const [redirectLoading, setRedirectLoading] = useState(false);
  const questionsPerPage = 40;
  const { user, isAuthenticated } = useAuthContext();
  // const [alertShown, setAlertShown] = useState(false);
  const [message, setMessage] = useState('');
  // const [bookmarks, setBookmarks] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  console.log(user);

  useEffect(() => {
    if (isAuthenticated && user && user._id) {
      fetchBookmarkedQuestions(user._id);
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
  

  const fetchBookmarkedQuestions = async (userId) => {
    try {
      const response = await fetch(`/user/bookmarks/${userId}`);
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setBookmarkedQuestions(data);
        
      } else {
        console.error('Failed to fetch bookmarked questions');
      }
    } catch (error) {
      console.error('Error fetching bookmarked questions', error);
    } finally{
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
        // Remove the deleted bookmark from the state
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
  if(message){
    return <div className='loading'>Login to view this page</div>;
  }
  if (loading && !message) {
    return <div className='loading'>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  if (redirectLoading) {
  return (
    <Loader
      title="Redirecting..."
      subtitle="Please wait while we take you to the login page."
    />
  );
}

  return (
    <>
    <div className='questions-list'>
        { loading && message && <p>{message}</p>}
      <TagFilter tags={allTags} selectedTags={selectedTags} onTagChange={handleTagChange} />

      {currentQuestions.length === 0 && (
        <div style={{ textAlign: 'center', color: '#888', fontSize: '1.3rem', fontWeight: 600, margin: '32px 0' }}>
          No Bookmarks
        </div>
      )}

      {currentQuestions.map((question) => (
        <div key={question._id} className="bookmark-bubble">
          <Link to={`/bookmarks/${question.titleSlug}`} className="bookmark-bubble-title">
            {question.title}
          </Link>
          <div className="bookmark-bubble-tags">
            {question.topicTags.map((tag, tagIndex) => (
              <span key={tagIndex} className="tag">{tag.name}</span>
            ))}
          </div>
          <button 
            className="delete-btn" 
            onClick={() => handleDeleteBookmark(question.titleSlug)}
          >
            Delete
          </button>
        </div>
      ))}
      
    </div>

    <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />
    
    <ConfirmationDialog
      isOpen={showDeleteDialog}
      onConfirm={confirmDelete}
      onCancel={cancelDelete}
      title="Delete Bookmark"
      message="Are you sure you want to delete this bookmark? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
    />
  </>
  );
};

export default Bookmarks;