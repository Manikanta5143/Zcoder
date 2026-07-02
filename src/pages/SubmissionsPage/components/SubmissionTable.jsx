import React from "react";
import SubmissionRow from "./SubmissionRow";
import "./SubmissionTable.css";

export default function SubmissionTable({
    submissions,
    onDelete,
    submissionCounts
}) {
    return (
        <div className="table-wrapper">
            <div className="submission-table">
                {/* Table Header */}
                <div className="submission-table-header">
                    <div className="sub-header-col col-submitted">
                        <span>Last Submitted</span>
                        <span className="sort-arrows">⇅</span>
                    </div>
                    <div className="sub-header-col col-problem">
                        <span>Problem</span>
                        <span className="sort-arrows">⇅</span>
                    </div>
                    <div className="sub-header-col col-difficulty">
                        <span>Difficulty</span>
                        <span className="sort-arrows">⇅</span>
                    </div>
                    <div className="sub-header-col col-result">
                        <span>Last Result</span>
                        <span className="sort-arrows">⇅</span>
                    </div>
                    <div className="sub-header-col col-submissions">
                        <span>Submissions</span>
                        <span className="sort-arrows">⇅</span>
                    </div>
                    <div className="sub-header-col col-actions">
                        <span>Actions</span>
                    </div>
                </div>

                {/* Table Body */}
                <div className="submission-table-body">
                    {submissions.map((question) => (
                        <SubmissionRow
                            key={question._id}
                            question={question}
                            onDelete={onDelete}
                            subCount={submissionCounts[question.titleSlug] || 1}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}