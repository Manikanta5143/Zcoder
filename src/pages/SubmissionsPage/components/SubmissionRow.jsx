import { Link } from "react-router-dom";
import { FiEye, FiTrash2 } from "react-icons/fi";
import "./SubmissionRow.css";

export default function SubmissionRow({ question, onDelete }) {

    const date = new Date(question.createdAt);

    return (

        <div className="submission-row">

            {/* Date */}

            <div className="submission-date">

                <span className="day">

                    {date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    })}

                </span>

                <span className="time">

                    {date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}

                </span>

            </div>

            {/* Problem */}

            <div className="problem-info">

                <Link
                    to={`/submissions/${question.titleSlug}`}
                    className="problem-title"
                >
                    {question.title}
                </Link>

                <div className="problem-meta">

                    {question.topicTags.slice(0, 2).map(tag => (

                        <span key={tag.name}>

                            {tag.name}

                        </span>

                    ))}

                </div>

            </div>

            {/* Language */}

            <div>

                <span className="language-pill">

                    {question.language}

                </span>

            </div>

            {/* Status */}

            <div>

                <span className="status accepted">

                    <span className="status-dot"></span>

                    Accepted

                </span>

            </div>

            {/* Actions */}

            <div className="row-actions">

                <Link
                    to={`/submissions/${question.titleSlug}`}
                    className="view-btn"
                >

                    <FiEye />

                </Link>

                <button
                    className="delete-row-btn"
                    onClick={() => onDelete(question._id)}
                >

                    <FiTrash2 />

                </button>

            </div>

        </div>

    );

}