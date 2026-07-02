import React from "react";
import { Link } from "react-router-dom";
import { FiClock, FiCheck, FiX, FiChevronDown, FiTrash2, FiCheckCircle, FiXCircle } from "react-icons/fi";
import "./SubmissionRow.css";

export default function SubmissionRow({ question, onDelete, subCount }) {
    const date = new Date(question.createdAt);
    
    // Formatting date and time
    const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
    
    const timeStr = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    const isAccepted = question.verdict === "Accepted";

    // Difficulty text colors mapping
    const diffColorClass = question.difficulty ? question.difficulty.toLowerCase() : "medium";

    return (
        <div className="submission-row">
            {/* 1. Last Submitted */}
            <div className="sub-row-col col-submitted">
                <FiClock className="submitted-clock-icon" />
                <div className="submitted-time-stack">
                    <span className="submitted-date-txt">{dateStr}</span>
                    <span className="submitted-time-txt">{timeStr}</span>
                </div>
            </div>

            {/* 2. Problem with status icon and tags */}
            <div className="sub-row-col col-problem">
                <div className="problem-title-row">
                    {isAccepted ? (
                        <div className="status-badge-inline accepted">
                            <FiCheck className="status-check-icon" />
                        </div>
                    ) : (
                        <div className="status-badge-inline rejected">
                            <FiX className="status-cross-icon" />
                        </div>
                    )}
                    <Link
                        to={`/submissions/${question.titleSlug}`}
                        className="problem-title-link"
                    >
                        {question.title}
                    </Link>
                </div>
                <div className="problem-tags-row">
                    {question.topicTags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="problem-tag-pill">
                            {tag.name}
                        </span>
                    ))}
                </div>
            </div>

            {/* 3. Difficulty (Plain text representation) */}
            <div className="sub-row-col col-difficulty">
                <span className={`diff-text-plain ${diffColorClass}`}>
                    {question.difficulty || "Medium"}
                </span>
            </div>

            {/* 4. Last Result with icon and runtime info */}
            <div className="sub-row-col col-result">
                {isAccepted ? (
                    <div className="result-verdict-box accepted">
                        <div className="verdict-title-row">
                            <FiCheck className="result-check" />
                            <span>Accepted</span>
                        </div>
                        <span className="result-runtime">{question.runtime || "0 ms"}</span>
                    </div>
                ) : (
                    <div className="result-verdict-box rejected">
                        <div className="verdict-title-row">
                            <FiX className="result-cross" />
                            <span>
                                {question.verdict === "Time Limit Exceeded" ? "Time Limit" : (question.verdict || "Wrong Answer")}
                            </span>
                        </div>
                        <span className="result-runtime">
                            {question.verdict === "Time Limit Exceeded" ? "Exceeded" : ""}
                        </span>
                    </div>
                )}
            </div>

            {/* 5. Submissions count with dropdown icon */}
            <div className="sub-row-col col-submissions">
                <div className="submissions-count-wrapper">
                    <span>{subCount}</span>
                    <FiChevronDown className="count-chevron-down" />
                </div>
            </div>

            {/* 6. Actions */}
            <div className="sub-row-col col-actions">
                <Link
                    to={`/submissions/${question.titleSlug}`}
                    className="view-solution-link-text"
                >
                    View Solution →
                </Link>
                <button
                    className="submission-row-delete-btn"
                    onClick={() => onDelete(question._id)}
                    title="Delete Submission"
                >
                    <FiTrash2 />
                </button>
            </div>
        </div>
    );
}