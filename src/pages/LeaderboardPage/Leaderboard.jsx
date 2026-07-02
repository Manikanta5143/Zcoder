import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';
import {
  FiSearch,
  FiTarget,
  FiAward,
  FiRefreshCw
} from 'react-icons/fi';
import { FaTrophy, FaFire } from 'react-icons/fa';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rank'); // 'rank' | 'solved' | 'streak' | 'score'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/leaderboard');
      if (!response.ok) {
        throw new Error('Failed to retrieve leaderboard rankings.');
      }
      const data = await response.json();
      setLeaderboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder(field === 'rank' ? 'asc' : 'desc'); // rank ascending is better, others descending is better
    }
  };

  // 1. Filtering by username search
  const filteredData = useMemo(() => {
    return leaderboard.filter(item =>
      (item.username || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leaderboard, searchTerm]);

  // 2. Sorting
  const sortedData = useMemo(() => {
    const data = [...filteredData];
    data.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'rank') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }

      // For score, solved, streak
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [filteredData, sortBy, sortOrder]);

  const renderRankMedal = (rank) => {
    if (rank === 1) return <span className="medal gold" title="1st Place">🥇</span>;
    if (rank === 2) return <span className="medal silver" title="2nd Place">🥈</span>;
    if (rank === 3) return <span className="medal bronze" title="3rd Place">🥉</span>;
    return <span className="rank-num">{rank}</span>;
  };

  if (loading) {
    return <Loader title="Loading Leaderboard" subtitle="Compiling standings and rankings..." />;
  }

  if (error) {
    return (
      <div className="leaderboard-error">
        <FaTrophy size={48} className="error-trophy" />
        <h2>Standings Unavailable</h2>
        <p>{error}</p>
        <button onClick={fetchLeaderboard} className="retry-btn">
          <FiRefreshCw /> Reload
        </button>
      </div>
    );
  }

  return (
    <div className="leaderboard-page-container">
      {/* 1. Header Hero Banner */}
      <div className="leaderboard-hero-banner">
        <div className="hero-left">
          <div className="hero-title-row">
            <FaTrophy className="hero-trophy-icon" />
            <h1>Global Leaderboard</h1>
          </div>
          <p>Compete with top developers worldwide. Standing ranks are computed based on problems solved, difficulty weighting, and active streak counts.</p>
        </div>
        <div className="hero-right-metrics">
          <div className="banner-metric">
            <span className="lbl">Total Coders</span>
            <span className="val">{leaderboard.length}</span>
          </div>
        </div>
      </div>

      {/* 2. Controls Panel */}
      <div className="leaderboard-controls-card">
        <div className="search-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search coder by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={fetchLeaderboard} className="refresh-btn" title="Refresh standings">
          <FiRefreshCw />
          <span>Refresh</span>
        </button>
      </div>

      {/* 3. Podiums for Top 3 */}
      {sortedData.length >= 3 && searchTerm === '' && (
        <div className="podium-row">
          {/* 2nd Place */}
          <div className="podium-col second">
            <div className="podium-avatar silver">
              {sortedData[1].username?.charAt(0).toUpperCase()}
            </div>
            <span className="podium-name">{sortedData[1].username}</span>
            <span className="podium-score">{sortedData[1].score} pts</span>
            <div className="podium-base second-base">
              <span className="place-num">2</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="podium-col first">
            <div className="crown-icon">👑</div>
            <div className="podium-avatar gold">
              {sortedData[0].username?.charAt(0).toUpperCase()}
            </div>
            <span className="podium-name">{sortedData[0].username}</span>
            <span className="podium-score">{sortedData[0].score} pts</span>
            <div className="podium-base first-base">
              <span className="place-num">1</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="podium-col third">
            <div className="podium-avatar bronze">
              {sortedData[2].username?.charAt(0).toUpperCase()}
            </div>
            <span className="podium-name">{sortedData[2].username}</span>
            <span className="podium-score">{sortedData[2].score} pts</span>
            <div className="podium-base third-base">
              <span className="place-num">3</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Leaderboard Standings Table */}
      <div className="leaderboard-table-wrapper">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th className="th-rank sortable" onClick={() => handleSort("rank")}>
                Rank {sortBy === "rank" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="th-user">Coder</th>
              <th className="th-solved sortable" onClick={() => handleSort("solved")}>
                Solved {sortBy === "solved" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="th-acceptance">Acceptance</th>
              <th className="th-streak sortable" onClick={() => handleSort("streak")}>
                Streak {sortBy === "streak" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="th-score sortable" onClick={() => handleSort("score")}>
                Total Score {sortBy === "score" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item) => (
              <tr key={item.userId} className="leaderboard-row">
                {/* 1. Rank */}
                <td>
                  <div className="rank-cell">
                    {renderRankMedal(item.rank)}
                  </div>
                </td>

                {/* 2. User */}
                <td>
                  <div className="user-cell">
                    <div className="user-avatar-mini">
                      {item.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="username-link">{item.username}</span>
                  </div>
                </td>

                {/* 3. Solved Breakdown Badges */}
                <td>
                  <div className="solved-breakdown-cell">
                    <strong className="solved-total-badge">{item.solved}</strong>
                    <div className="mini-breakdown">
                      <span className="break-easy" title="Easy Solved">{item.solvedBreakdown?.easy || 0}E</span>
                      <span className="break-medium" title="Medium Solved">{item.solvedBreakdown?.medium || 0}M</span>
                      <span className="break-hard" title="Hard Solved">{item.solvedBreakdown?.hard || 0}H</span>
                    </div>
                  </div>
                </td>

                {/* 4. Acceptance Rate */}
                <td>
                  <div className="acceptance-cell">
                    <FiTarget className="cell-icon" />
                    <span>{item.acceptanceRate}%</span>
                  </div>
                </td>

                {/* 5. Streak */}
                <td>
                  <div className="streak-cell">
                    <FaFire className={`cell-icon streak ${item.streak > 0 ? 'active' : ''}`} />
                    <span>{item.streak} days</span>
                  </div>
                </td>

                {/* 6. Score */}
                <td>
                  <div className="score-cell">
                    <FiAward className="cell-icon score" />
                    <strong>{item.score} pts</strong>
                  </div>
                </td>
              </tr>
            ))}

            {sortedData.length === 0 && (
              <tr>
                <td colSpan="6" className="no-leaderboard-td">
                  <div className="no-data-msg">No coders found matching your search.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
