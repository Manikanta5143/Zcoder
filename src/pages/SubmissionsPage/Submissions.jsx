import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import TagFilter from '../../components/TagFilter/TagFilter';
import Pagination from '../../components/Pagination/Pagination';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';
import { Link, useNavigate } from 'react-router-dom';
import './Submissions.css'

const Submissions = () => {
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState([]);
  const questionsPerPage = 40;
  // const [alertShown, setAlertShown] = useState(false);
  const [message, setMessage] = useState('');
  const { user, isAuthenticated } = useAuthContext();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);



  
  useEffect(() => {
    if (isAuthenticated && user && user._id) {
      fetchSubmissions(user._id);
    } else {
      if (!message) {
        setMessage('You need to be logged in to view this page.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    }
  }, [user, isAuthenticated]);

  const fetchSubmissions = async (userId) => {
    try {
      const response = await fetch(`/user/solutions/byUser/${userId}`);
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setSubmissions(data);
      } else {
        
        console.error('Failed to fetch  questions');
      }
    } catch (error) {
      console.error('Error fetching  questions', error);
    }finally {
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
        // Remove the deleted submission from the state
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


  return (

    <>
      <div className="questions-list">
        <TagFilter tags={allTags} selectedTags={selectedTags} onTagChange={handleTagChange} />

        {currentQuestions.length === 0 && (
          <div style={{ textAlign: 'center', color: '#888', fontSize: '1.3rem', fontWeight: 600, margin: '32px 0' }}>
            No Submissions
          </div>
        )}
        {currentQuestions.map((question) => (
          <div key={question._id} className="submission-bubble">
            <Link to={`/submissions/${question.titleSlug}`} className="submission-bubble-title">
              {question.title}
              <p className='submission-bubble-time'>
                Submitted at: {isNaN(new Date(question.createdAt)) ? 'Invalid Date' : new Date(question.createdAt).toLocaleString()}
              </p>
            </Link>
            <div className="submission-bubble-tags">
              {question.topicTags.map((tag, tagIndex) => (
                <span key={tagIndex} className="tag">{tag.name}</span>
              ))}
            </div>
            <button 
              className="delete-btn" 
              onClick={() => handleDeleteSubmission(question._id)}
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
        title="Delete Submission"
        message="Are you sure you want to delete this submission? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>

    // <div className='submissions'>
    //   <h2>Submissions</h2>
    //   <ul>
       
    //     {submissions.map((submission, index) => (
    //       <li key={index}>{submission.title}</li>
    //     ))}
    //   </ul>
    // </div>
  );
};

export default Submissions;