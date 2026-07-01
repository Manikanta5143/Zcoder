import "./DashboardCards.css";

export default function DashboardCards({

    total,

    topics,

    visible

}){

    return(

        <div className="dashboard-grid">

            <div className="dashboard-card">

                <div className="dashboard-icon">

                    📄

                </div>

                <div>

                    <p>Total Submissions</p>

                    <h2>{total}</h2>

                </div>

            </div>

            <div className="dashboard-card">

                <div className="dashboard-icon">

                    🏷

                </div>

                <div>

                    <p>Topics Covered</p>

                    <h2>{topics}</h2>

                </div>

            </div>

            <div className="dashboard-card">

                <div className="dashboard-icon">

                    👁

                </div>

                <div>

                    <p>Visible Results</p>

                    <h2>{visible}</h2>

                </div>

            </div>

        </div>

    );

}