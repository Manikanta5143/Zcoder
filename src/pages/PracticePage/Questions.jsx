import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TagFilter from '../../components/TagFilter/TagFilter';
import Pagination from '../../components/Pagination/Pagination';
import { useQuestionsApi } from '../../hooks/useQuestionsApi';
import './Questions.css';
import Loader from '../../components/Loader/Loader';
const Questions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState([]);
  const questionsPerPage = 40;

  // Use the custom hook for API handling
  const {
    problems,
    loading,
    error
  } = useQuestionsApi();

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;

  const filteredProblems = problems.filter(problem =>
    selectedTags.length === 0 ||
    problem.topicTags.some(tag => selectedTags.includes(tag.name))
  );

  const currentQuestions = filteredProblems.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const allTags = [...new Set(problems.flatMap(problem => problem.topicTags.map(tag => tag.name)))];

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleTagChange = (tag) => {
    setSelectedTags(prevSelectedTags =>
      prevSelectedTags.includes(tag)
        ? prevSelectedTags.filter(t => t !== tag)
        : [...prevSelectedTags, tag]
    );
    setCurrentPage(1);
  };

  if (loading) {
  return (
    <Loader
      title="Loading Questions..."
      subtitle="Fetching the latest coding problems."
    />
  );
}

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Reload Page
        </button>
      </div>
    );
  }

  const totalPages = Math.ceil(filteredProblems.length / questionsPerPage);

  return (
    <>
      <div className="questions-header">
        <h2>Practice Questions</h2>
      </div>

      <div className="questions-list">
        <TagFilter tags={allTags} selectedTags={selectedTags} onTagChange={handleTagChange} />

        {currentQuestions.map((problem, index) => (

<div key={index} className="question-item">

    <div className="question-left">

        <Link
            className="question-title"
            to={`/practice/${problem.titleSlug}`}
        >
            {problem.title}
        </Link>

    </div>

    <div className="question-right">

        <div className="tags">

            {problem.topicTags
                .slice(0,3)
                .map((tag, tagIndex)=>(
                    <span
                        key={tagIndex}
                        className="tag"
                    >
                        {tag.name}
                    </span>
                ))}

        </div>

    </div>

</div>

))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />
    </>
  );
};

export default Questions;
