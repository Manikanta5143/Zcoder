import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './ProblemStatement.module.css'
import { IoIosArrowDown,IoIosArrowUp, IoMdBookmark } from "react-icons/io";
import {useAuthContext} from '../../hooks/useAuthContext';
import { useProblemStatementApi } from '../../hooks/useProblemStatementApi';
import { useQuestionsApi } from '../../hooks/useQuestionsApi';

const ProblemStatement = () => {
  const { titleSlug } = useParams();
  const [solution, setSolution] = useState('');
  const [language, setLanguage] = useState('javascript'); // State to track selected language
  const [solutions, setSolutions] = useState([]);
  const [showSolutions, setShowSolutions] = useState(false);
  const [showComments,setShowComments] = useState(false);
  const [activeSolution, setActiveSolution] = useState(null);
  const [comments, setComments] = useState({}); // State to store comments for a solution
  const [visibleComments, setVisibleComments] = useState(null);
  const [alertShown, setAlertShown] = useState(false);
  
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();
  const [bookmarks, setBookmarks] = useState([]);
  
  // Use the custom hook for API handling
  const {
    problem,
    loading,
    error
  } = useProblemStatementApi(titleSlug);
  
  const { problems, loading: questionsLoading, error: questionsError } = useQuestionsApi();
  
  useEffect(() => {
    // Fetch user's bookmarks when user changes
    if (user && user._id) {
      fetchBookmarks(user._id);
    } else {
      // If no user, set empty bookmarks
      setBookmarks([]);
    }
  }, [user]);
  
  const fetchBookmarks = async (userId) => {
    try {
      const response = await fetch(`/user/bookmarks/${userId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Bookmarks data:', data);

        // Extract all solutionIds from the data with proper null checks
        const allSolutionIds = data.reduce((acc, bookmark) => {
          if (bookmark && bookmark.solutions && Array.isArray(bookmark.solutions)) {
          bookmark.solutions.forEach(solution => {
              // Check if solution has _id directly (new structure) or solutionId._id (old structure)
              if (solution && solution._id) {
                acc.push(solution._id);
              } else if (solution && solution.solutionId && solution.solutionId._id) {
            acc.push(solution.solutionId._id);
              }
          });
          }
          return acc;
        }, []);
        
        console.log('All Solution IDs:', allSolutionIds);
        setBookmarks(allSolutionIds);
      } else {
        console.error('Failed to fetch bookmarks');
        setBookmarks([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      setBookmarks([]); // Set empty array on error
    }
  };

  const handleSolutionChange = (e) => {
    setSolution(e.target.value);
    // console.log(solution);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handlePostSolution = async () => {
    if(!isAuthenticated){
      if (!alertShown) {
        alert('You need to be logged in to view this page.');
        setAlertShown(true);
        navigate('/login'); // Redirect to login page or another appropriate page
      }
      return;
    }

    // Check if problem data is available
    if (!problem || !problem.questionTitle || !problem.topicTags) {
      alert('Problem data is not available. Please refresh the page.');
      return;
    }

    // Check if user data is available
    if (!user || !user._id || !user.username) {
      alert('User data is not available. Please log in again.');
      return;
    }

     try{
      const response = await fetch('/user/solutions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId:user._id, titleSlug, title:problem.questionTitle, solution, language, username:user.username, topicTags: problem.topicTags}),
      });
      console.log(response);
      if (response.ok) {
        alert('Solution posted successfully');
        setSolution('');
      } 
      else {
        alert('Nothing is posted');
      }
    } 
    catch (error) {
      console.log(error);
      alert('Error posting solution');
    }
  };
  
  const handleBookmark = async (sol) => {
    // Check if user is authenticated
    if (!user || !user._id) {
      alert('You need to be logged in to bookmark solutions.');
      return;
    }

    const isBookmarked = bookmarks.includes(sol._id);
    
    if(!isBookmarked){
      try {
        const response = await fetch('/user/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            solutionId:sol._id,
            userId:user._id, 
            title:problem.questionTitle,
            titleSlug,
            language: sol.language,
            solution: sol.solution,
            topicTags: problem.topicTags
          }),
        });
        if (response.ok) {
          setBookmarks((prevBookmarks) => [...prevBookmarks, sol._id]);
          console.log(bookmarks);
          alert('Solution bookmarked successfully');
        } else {
          alert('Failed to bookmark solution');
        }
      }catch (error) {
          console.error('Error bookmarking solution', error);
        }
    }else{
      try {
        const response = await fetch(`/user/bookmarks/${user._id}/${titleSlug}/${sol._id}`, {
          method: 'DELETE',
        });
      
        if (response.ok) {
          setBookmarks((prevBookmarks) => prevBookmarks.filter((id) => id!== sol._id));
          alert('Solution unbookmarked successfully');
        } else {
          const errorResponse = await response.json();
          console.error('Error unbookmarking solution:', errorResponse.error);
          alert('Failed to unbookmark solution');
        }
      } catch (error) {
        console.error('Error unbookmarking solution:', error);
        alert('Failed to unbookmark solution');
      }
    } 
  };

  const handlePostComment = async (solutionId, comment) => {
    // Check if user is authenticated
    if (!user || !user._id) {
      alert('You need to be logged in to post comments.');
      return;
    }

    try {
      const response = await fetch(`/user/comments/${solutionId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment, userId:user._id, solutionId:solutionId, username : user.username  }),
      });
      console.log(response);
      if (response.ok) {
        const newComment = await response.json();
        setComments((prevComments) => ({ ...prevComments, [solutionId]: [...(prevComments[solutionId] || []), newComment] }));
        // Update comments state for the specific solution
      } else {
        alert('Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    }
  };

  const fetchComments = async (solutionId) => {
    if(showComments){
      setShowComments(false);
      return;
    }
    try {
      const response = await fetch(`/user/comments/${solutionId}`);
      const data = await response.json();
      setComments((prevComments) => ({ ...prevComments, [solutionId]: data }));
      setShowComments(true);
    } catch (error) {
      console.error('Error fetching comments:', error);
      alert('Failed to fetch comments');
    }
  };

  const fetchSolutions = async () => {
    if (showSolutions) {
      setShowSolutions(false);
      return;
    }
    try {
      const response = await fetch(`/user/solutions/${titleSlug}`);
      const data = await response.json();
      console.log(data);
      setSolutions(data);
      setShowSolutions(true);
    } catch (error) {
      alert('Failed to fetch solutions');
    }
  };
  
  const toggleSolution = (id) => {
    setActiveSolution(activeSolution === id ? null : id);
  };

  const toggleComment = (id) =>{
    setVisibleComments(visibleComments === id ? null : id);
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>Loading problem statement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>Error Loading Problem</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.retryButton}>
          Reload Page
        </button>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className={styles.errorContainer}>
        <h3>Problem Not Found</h3>
        <p>The requested problem could not be found.</p>
        <button onClick={() => navigate('/practice')} className={styles.backButton}>
          Back to Practice
        </button>
      </div>
    );
  }

  return (
    <div className={styles.problemStatementContainer}>
      <div className={styles.problemStatement}>
        <div className={styles.problemHeader}>
        <p className={styles.title}>{problem.questionTitle}</p>
        </div>
        <div className={styles.questionStatement} dangerouslySetInnerHTML={{ __html: problem.question }} />
        <p>Hints</p>
        <div className={styles.questionHint} dangerouslySetInnerHTML={{ __html: problem.hints }} />
      </div>
      <div className={styles.solutionEditor}>
        <div className={styles.headers}>
          {/* select languages */}
          <select value={language} onChange={handleLanguageChange}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          <button className={styles.button} onClick={handlePostSolution}>Post your solution</button>
          <button  className={`${styles.button} ${showSolutions ? styles.show : ''}`} onClick={fetchSolutions}>Solutions </button>
          <button className={styles.button} onClick={()=>setShowSolutions(false)}>Go back </button>
        </div>
        {showSolutions ? (
          <div className={styles.solutionsList}>
            {solutions.map((sol) => (
              <div key={sol._id} className={styles.solutionItem}>
                <div className={styles.solutionHeader} onClick={() => toggleSolution(sol._id)}>
                  <p><strong>Language used:</strong> {sol.language}</p>
                  <p>Posted by:{sol.username}</p>
                  <p><strong>Posted at:</strong> {new Date(sol.createdAt).toLocaleString()}</p>
                  <IoMdBookmark className={`${styles.icon} ${bookmarks.includes(sol._id)? styles.bookmarkIcon : ''}`} onClick={() => handleBookmark(sol)} />
                  {activeSolution === sol._id ? <IoIosArrowDown className={styles.icon}/> : <IoIosArrowUp className={styles.icon} /> }
                </div>  
                <div className={`${styles.solutionContent} ${activeSolution === sol._id ? styles.show : ''}`}>
                  <SyntaxHighlighter language={sol.language} style={okaidia} >
                    {sol.solution}
                  </SyntaxHighlighter>
                  <button className={styles.button} onClick={() => fetchComments(sol._id)}>View Comments</button> 
                  { showComments && comments[sol._id] && (
                    <div className={styles.comments}>
                      {comments[sol._id].map((comment) => (
                        <div key={comment._id} className={styles.comment}>
                          <p className={styles.commentContent}>{comment.content}</p>
                          <div className={styles.userData}>
                            {comment.username && <p>Posted by: {new Date(comment.createdAt).toLocaleString()}</p>}
                            {comment.username && <p>Posted by: {comment.username}</p>}
                          </div>
                        </div>
                      ))}
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const comment = e.target.elements.commentInput.value;
                        handlePostComment(sol._id, comment);
                        e.target.elements.commentInput.value = '';
                      }}>
                        <textarea name="commentInput" placeholder="Write your comment here..." />
                        <button className={styles.button} type="submit">Post Comment</button>
                      </form>
                    </div>
                  )}
                </div>   
              </div>
            ))}
          </div>
        ) : (
          <textarea 
            className={styles.solutionInput} 
            value={solution} 
            onChange={handleSolutionChange} 
            placeholder="Write your solution here..."
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}

export default ProblemStatement;