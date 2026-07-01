import SubmissionRow from "./SubmissionRow";
import "./SubmissionTable.css";

export default function SubmissionTable({
    submissions,
    onDelete
}) {

    return (

        <div className="table-wrapper">

            <div className="submission-table">

                {/* Table Header */}

                <div className="submission-table-header">

                    <div>📅 Date</div>

                    <div>📄 Problem</div>

                    <div>💻 Language</div>

                    <div>✅ Status</div>

                    <div>⚙ Action</div>

                </div>

                {/* Table Body */}

                {submissions.length > 0 ? (

                    submissions.map((question) => (

                        <SubmissionRow
                            key={question._id}
                            question={question}
                            onDelete={onDelete}
                        />

                    ))

                ) : (

                    <div className="no-submissions">

                        No submissions found.

                    </div>

                )}

            </div>

        </div>

    );

}