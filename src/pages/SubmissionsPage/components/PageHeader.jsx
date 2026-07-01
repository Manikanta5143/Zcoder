import "./PageHeader.css";

export default function PageHeader() {
    return (
        <div className="submission-page-header">

            <div>

                <h1>My Submissions</h1>

                <p>
                    Track every solution you've solved and submitted.
                </p>

            </div>

            <button className="filter-btn">

                🔍 Filter

            </button>

        </div>
    );
}