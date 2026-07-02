import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';
import ActivityHeatmap from '../../components/Analytics/ActivityHeatmap';
import { LineChart, DoughnutChart, BarChart } from '../../components/Analytics/SvgCharts';
import { 
  FiUser, 
  FiMail, 
  FiCpu, 
  FiPlus, 
  FiTrash2, 
  FiEdit, 
  FiSearch, 
  FiUserPlus, 
  FiSettings,
  FiBookOpen,
  FiAward,
  FiBookmark,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import styles from './Profile.module.css';

const Profile = () => {
  const { isAuthenticated, user } = useAuthContext();
  const navigate = useNavigate();

  // Sidebar editable fields
  const [techStacks, setTechStacks] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [friends, setFriends] = useState([]);
  
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchMsg, setSearchMsg] = useState('');
  
  const [newTechStack, setNewTechStack] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [handle, setHandle] = useState('');
  const [handles, setHandles] = useState([]);
  
  // Dashboard stats
  const [submissions, setSubmissions] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user && user._id) {
      setProfileLoading(true);
      Promise.all([
        fetchUserData(user._id),
        fetchHandles(user._id),
        fetchUserSubmissions(user._id),
        fetchUserBookmarks(user._id)
      ]).finally(() => {
        setProfileLoading(false);
      });
    }
  }, [user, isAuthenticated]);

  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8008/user/${userId}`);
      setTechStacks(response.data.techStacks || []);
      setLanguages(response.data.languages || []);
      setFriends(response.data.friends || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUserSubmissions = async (userId) => {
    try {
      const response = await fetch(`/user/solutions/byUser/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error('Error fetching user submissions:', err);
    }
  };

  const fetchUserBookmarks = async (userId) => {
    try {
      const response = await fetch(`/user/bookmarks/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setBookmarks(data);
      }
    } catch (err) {
      console.error('Error fetching user bookmarks:', err);
    }
  };

  const fetchHandles = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8008/user/${userId}/handles`);
      const handlesData = await Promise.all(
        (response.data || []).map(async (h) => {
          try {
            const ratingResponse = await axios.get(`https://codeforces.com/api/user.rating?handle=${h}`);
            const ratings = ratingResponse.data.result;
            const currentRating = ratings.length > 0 ? ratings[ratings.length - 1].newRating : 'No rating';
            return { handle: h, currentRating };
          } catch (e) {
            return { handle: h, currentRating: 'N/A' };
          }
        })
      );
      setHandles(handlesData);
    } catch (error) {
      console.error('Error fetching handles:', error);
    }
  };

  // Tech stack, languages, friends management
  const handleDeleteTechStack = async (index) => {
    try {
      const updated = [...techStacks];
      updated.splice(index, 1);
      await axios.put(`http://localhost:8008/user/${user._id}/techstacks`, { techStacks: updated });
      setTechStacks(updated);
    } catch (error) {
      alert('Error deleting tech stack');
    }
  };

  const handleEditTechStack = async (index, updatedStack) => {
    try {
      const updated = [...techStacks];
      updated[index] = updatedStack;
      await axios.put(`http://localhost:8008/user/${user._id}/techstacks`, { techStacks: updated });
      setTechStacks(updated);
    } catch (error) {
      alert('Error updating tech stack');
    }
  };

  const handleAddTechStack = async () => {
    if (!newTechStack.trim()) return;
    try {
      const updated = [...techStacks, newTechStack.trim()];
      await axios.put(`http://localhost:8008/user/${user._id}/techstacks`, { techStacks: updated });
      setTechStacks(updated);
      setNewTechStack('');
    } catch (error) {
      alert('Error adding tech stack');
    }
  };

  const handleDeleteLanguage = async (index) => {
    try {
      const updated = [...languages];
      updated.splice(index, 1);
      await axios.put(`http://localhost:8008/user/${user._id}/languages`, { languages: updated });
      setLanguages(updated);
    } catch (error) {
      alert('Error deleting language');
    }
  };

  const handleEditLanguage = async (index, updatedLanguage) => {
    try {
      const updated = [...languages];
      updated[index] = updatedLanguage;
      await axios.put(`http://localhost:8008/user/${user._id}/languages`, { languages: updated });
      setLanguages(updated);
    } catch (error) {
      alert('Error updating language');
    }
  };

  const handleAddLanguage = async () => {
    if (!newLanguage.trim()) return;
    try {
      const updated = [...languages, newLanguage.trim()];
      await axios.put(`http://localhost:8008/user/${user._id}/languages`, { languages: updated });
      setLanguages(updated);
      setNewLanguage('');
    } catch (error) {
      alert('Error adding language');
    }
  };

  const handleDeleteFriend = async (friendUsername) => {
    try {
      const updated = friends.filter(f => f !== friendUsername);
      await axios.put(`http://localhost:8008/user/${user._id}/friends`, { friends: updated });
      setFriends(updated);
    } catch (error) {
      alert('Error deleting friend');
    }
  };

  const handleSearchUser = async () => {
    if (!searchUsername.trim()) return;
    try {
      setSearchMsg('');
      const response = await axios.get(`http://localhost:8008/search`, { params: { username: searchUsername } });
      setSearchResult(response.data);
    } catch (error) {
      setSearchResult(null);
      if (error.response && error.response.status === 404) {
        setSearchMsg('User not found');
      } else {
        setSearchMsg('Search error');
      }
    }
  };

  const handleAddFriend = async () => {
    if (!searchResult) return;
    try {
      const friendUsername = searchResult.username;
      await axios.put(`http://localhost:8008/user/${user._id}/add-friend`, { friendUsername });
      setFriends([...friends, friendUsername]);
      setSearchUsername('');
      setSearchResult(null);
      setSearchMsg('');
      alert("Friend added successfully");
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding friend');
    }
  };

  const handleAddHandle = async () => {
    if (!handle.trim()) return;
    try {
      await axios.post(`http://localhost:8008/user/${user._id}/handles`, { handle: handle.trim() });
      setHandle('');
      fetchHandles(user._id);
    } catch (error) {
      alert('Error adding Codeforces handle');
    }
  };

  const handleDeleteHandle = async (handleToDelete) => {
    try {
      await axios.delete(`http://localhost:8008/user/${user._id}/handles/${handleToDelete}`);
      fetchHandles(user._id);
    } catch (error) {
      alert('Error deleting Codeforces handle');
    }
  };

  // ==========================================
  // DYNAMIC STATS CALCULATIONS
  // ==========================================
  const stats = useMemo(() => {
    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter(s => s.verdict === 'Accepted');
    
    // Solved problems count (unique titleSlug solves)
    const solvedSlugs = new Set(acceptedSubmissions.map(s => s.titleSlug));
    const solvedCount = solvedSlugs.size;

    // Difficulty breakdown mapping
    const solvedDifficultyMap = new Map();
    acceptedSubmissions.forEach(s => {
      solvedDifficultyMap.set(s.titleSlug, s.difficulty || 'Medium');
    });

    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;
    solvedDifficultyMap.forEach((diff) => {
      if (diff === 'Easy') easySolved++;
      else if (diff === 'Hard') hardSolved++;
      else mediumSolved++;
    });

    // Acceptance Rate (Total accepted solves / total submissions)
    const acceptanceRate = totalSubmissions > 0
      ? Math.round((acceptedSubmissions.length / totalSubmissions) * 100)
      : 0;

    // Success Rate (Unique solved / total submissions)
    const successRate = totalSubmissions > 0
      ? Math.round((solvedCount / totalSubmissions) * 100)
      : 0;

    // Streak Calculations
    const uniqueSolvedDates = acceptedSubmissions
      .map(sub => new Date(sub.createdAt).toDateString())
      .filter((val, idx, self) => self.indexOf(val) === idx)
      .map(d => new Date(d))
      .sort((a, b) => b - a); // descending

    let currentStreak = 0;
    let longestStreak = 0;

    if (uniqueSolvedDates.length > 0) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let lastDate = uniqueSolvedDates[0];
      lastDate.setHours(0,0,0,0);

      // Verify if current streak is active (solved today or yesterday)
      if (lastDate.getTime() === today.getTime() || lastDate.getTime() === yesterday.getTime()) {
        currentStreak = 1;
        let tempStreak = 1;
        let prevRunDate = lastDate;

        for (let i = 1; i < uniqueSolvedDates.length; i++) {
          const nextTargetDate = new Date(prevRunDate);
          nextTargetDate.setDate(nextTargetDate.getDate() - 1);
          const currDate = uniqueSolvedDates[i];
          currDate.setHours(0,0,0,0);

          if (currDate.getTime() === nextTargetDate.getTime()) {
            tempStreak++;
            prevRunDate = currDate;
          } else {
            break;
          }
        }
        currentStreak = tempStreak;
      }

      // Calculate longest streak
      let tempStreak = 1;
      let prevRunDate = uniqueSolvedDates[0];
      prevRunDate.setHours(0,0,0,0);
      longestStreak = 1;

      for (let i = 1; i < uniqueSolvedDates.length; i++) {
        const nextTargetDate = new Date(prevRunDate);
        nextTargetDate.setDate(nextTargetDate.getDate() - 1);
        const currDate = uniqueSolvedDates[i];
        currDate.setHours(0,0,0,0);

        if (currDate.getTime() === nextTargetDate.getTime()) {
          tempStreak++;
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
        } else {
          tempStreak = 1;
        }
        prevRunDate = currDate;
      }
    }

    // Chart Data 1: Runtime History (last 10 solves)
    const runtimeHistory = acceptedSubmissions
      .slice(-10)
      .map((s, idx) => {
        const ms = s.runtime ? parseInt(s.runtime.replace(/[^0-9]/g, '')) || 0 : 0;
        return { label: `Sub #${idx + 1}`, value: ms };
      });

    // Chart Data 2: Memory Usage (last 10 solves)
    const memoryHistory = acceptedSubmissions
      .slice(-10)
      .map((s, idx) => {
        const mb = s.memory ? parseFloat(s.memory.replace(/[^0-9.]/g, '')) || 0 : 0;
        return { label: `Sub #${idx + 1}`, value: mb };
      });

    // Chart Data 3: Languages Used
    const langCounts = {};
    submissions.forEach(s => {
      const l = s.language || 'javascript';
      langCounts[l] = (langCounts[l] || 0) + 1;
    });
    const colors = ["#ef4444", "#3b82f6", "#22c55e", "#fbbf24", "#8b5cf6", "#14b8a6"];
    const languageUsageData = Object.entries(langCounts).map(([key, val], idx) => ({
      label: key,
      value: val,
      color: colors[idx % colors.length]
    }));

    // Chart Data 4: Submissions Frequencies per month (last 6 months)
    const freqData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialise last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      freqData[key] = 0;
    }

    submissions.forEach(s => {
      const date = new Date(s.createdAt);
      const key = `${months[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
      if (freqData[key] !== undefined) {
        freqData[key]++;
      }
    });

    const frequencyData = Object.entries(freqData).map(([key, val]) => ({
      label: key,
      value: val
    }));

    // Recent submissions (last 5)
    const recentSubmissions = submissions.slice(-5).reverse();

    return {
      totalSubmissions,
      solvedCount,
      easySolved,
      mediumSolved,
      hardSolved,
      acceptanceRate,
      successRate,
      currentStreak,
      longestStreak,
      runtimeHistory,
      memoryHistory,
      languageUsageData,
      frequencyData,
      recentSubmissions
    };
  }, [submissions]);

  if (profileLoading) {
    return <Loader title="Loading Dashboard" subtitle="Compiling solving metrics and contribution grids..." />;
  }

  return (
    <div className={styles.profilePageContainer}>
      <div className={styles.profileLayoutGrid}>
        
        {/* ==========================================
           LEFT PANEL: SIDEBAR EDIT DETAILS
           ========================================== */}
        <div className={styles.sidebar}>
          
          {/* Avatar and Username Card */}
          <div className={styles.avatarCard}>
            <div className={styles.avatarGlow}>
              <div className={styles.avatarImage}>
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            </div>
            <h3>{user?.username}</h3>
            <p className={styles.emailText}>
              <FiMail className={styles.sidebarIcon} /> {user?.email}
            </p>
          </div>

          {/* Tech Stacks section */}
          <div className={styles.sidebarSection}>
            <div className={styles.sectionHeader}>
              <h5>Tech Stacks</h5>
            </div>
            <ul className={styles.bubbleList}>
              {techStacks.map((stack, index) => (
                <li key={index} className={styles.bubbleItem}>
                  <span>{stack}</span>
                  <div className={styles.itemActions}>
                    <button 
                      onClick={() => {
                        const updated = prompt('Edit Tech Stack:', stack);
                        if (updated) handleEditTechStack(index, updated);
                      }}
                      className={styles.actionBtn}
                    >
                      <FiEdit size={12} />
                    </button>
                    <button onClick={() => handleDeleteTechStack(index)} className={styles.actionBtnDelete}>
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className={styles.addItemForm}>
              <input
                type="text"
                placeholder="Add tech stack..."
                value={newTechStack}
                onChange={(e) => setNewTechStack(e.target.value)}
              />
              <button onClick={handleAddTechStack} className={styles.addBtn}>
                <FiPlus />
              </button>
            </div>
          </div>

          {/* Languages section */}
          <div className={styles.sidebarSection}>
            <div className={styles.sectionHeader}>
              <h5>Languages</h5>
            </div>
            <ul className={styles.bubbleList}>
              {languages.map((lang, index) => (
                <li key={index} className={styles.bubbleItem}>
                  <span>{lang}</span>
                  <div className={styles.itemActions}>
                    <button 
                      onClick={() => {
                        const updated = prompt('Edit Language:', lang);
                        if (updated) handleEditLanguage(index, updated);
                      }}
                      className={styles.actionBtn}
                    >
                      <FiEdit size={12} />
                    </button>
                    <button onClick={() => handleDeleteLanguage(index)} className={styles.actionBtnDelete}>
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className={styles.addItemForm}>
              <input
                type="text"
                placeholder="Add language..."
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
              />
              <button onClick={handleAddLanguage} className={styles.addBtn}>
                <FiPlus />
              </button>
            </div>
          </div>

          {/* Friends section */}
          <div className={styles.sidebarSection}>
            <div className={styles.sectionHeader}>
              <h5>Friends ({friends.length})</h5>
            </div>
            
            <div className={styles.searchFriendForm}>
              <div className={styles.inputWrapper}>
                <FiSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search user..."
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                />
              </div>
              <button onClick={handleSearchUser} className={styles.searchBtn}>Search</button>
            </div>

            {searchResult && (
              <div className={styles.searchResultCard}>
                <span>Found: <strong>{searchResult.username}</strong></span>
                <button onClick={handleAddFriend} className={styles.addFriendActionBtn}>
                  <FiUserPlus /> Add
                </button>
              </div>
            )}
            {searchMsg && <span className={styles.searchError}>{searchMsg}</span>}

            <ul className={styles.friendsList}>
              {friends.map((friend, index) => (
                <li key={index} className={styles.friendItem}>
                  <span>{friend}</span>
                  <button onClick={() => handleDeleteFriend(friend)} className={styles.deleteFriendBtn} title="Remove friend">
                    <FiTrash2 size={12} />
                  </button>
                </li>
              ))}
              {friends.length === 0 && <li className={styles.emptyList}>No friends added yet</li>}
            </ul>
          </div>

          {/* Codeforces handles section */}
          <div className={styles.sidebarSection}>
            <div className={styles.sectionHeader}>
              <h5>Codeforces Ratings</h5>
            </div>
            
            <div className={styles.addItemForm}>
              <input
                type="text"
                placeholder="Add CF handle..."
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
              />
              <button onClick={handleAddHandle} className={styles.addBtn}>
                <FiPlus />
              </button>
            </div>

            <ul className={styles.cfList}>
              {handles.map(({ handle: h, currentRating }) => (
                <li key={h} className={styles.cfItem}>
                  <div className={styles.cfInfo}>
                    <strong className={styles.cfHandle}>{h}</strong>
                    <span className={styles.cfRating}>Rating: {currentRating}</span>
                  </div>
                  <button onClick={() => handleDeleteHandle(h)} className={styles.deleteCFBtn}>
                    <FiTrash2 size={12} />
                  </button>
                </li>
              ))}
              {handles.length === 0 && <li className={styles.emptyList}>No handles linked</li>}
            </ul>
          </div>

        </div>

        {/* ==========================================
           RIGHT PANEL: DASHBOARD ANALYTICS
           ========================================== */}
        <div className={styles.dashboard}>

          {/* User statistics Row cards */}
          <div className={styles.statsOverviewRow}>
            
            {/* 1. Solved Problems Progress */}
            <div className={styles.overviewCard}>
              <h4>Problems Solved</h4>
              <div className={styles.solvedWrapper}>
                <div className={styles.circularSolved}>
                  <span className={styles.countText}>{stats.solvedCount}</span>
                  <span className={styles.solvedLbl}>Solved</span>
                </div>
                <div className={styles.breakdownList}>
                  <div className={styles.breakdownItem}>
                    <span className={`${styles.diffDot} ${styles.easy}`} />
                    <span className={styles.diffName}>Easy</span>
                    <strong className={styles.diffValue}>{stats.easySolved}</strong>
                  </div>
                  <div className={styles.breakdownItem}>
                    <span className={`${styles.diffDot} ${styles.medium}`} />
                    <span className={styles.diffName}>Medium</span>
                    <strong className={styles.diffValue}>{stats.mediumSolved}</strong>
                  </div>
                  <div className={styles.breakdownItem}>
                    <span className={`${styles.diffDot} ${styles.hard}`} />
                    <span className={styles.diffName}>Hard</span>
                    <strong className={styles.diffValue}>{stats.hardSolved}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Streak Cards */}
            <div className={styles.streakGridCard}>
              <div className={styles.streakSubCard}>
                <FaFire className={styles.streakFlameIcon} />
                <div className={styles.streakMeta}>
                  <span>Current Streak</span>
                  <h2>{stats.currentStreak} Days</h2>
                </div>
              </div>
              <div className={styles.streakSubCard}>
                <FaFire className={styles.streakFlameIconLongest} />
                <div className={styles.streakMeta}>
                  <span>Longest Streak</span>
                  <h2>{stats.longestStreak} Days</h2>
                </div>
              </div>
            </div>

            {/* 3. Acceptance / Bookmarks */}
            <div className={styles.metricsSummaryCard}>
              <div className={styles.metricStrip}>
                <span>Acceptance Rate</span>
                <strong>{stats.acceptanceRate}%</strong>
              </div>
              <div className={styles.metricStrip}>
                <span>Bookmarks</span>
                <strong>{bookmarks.length} Problems</strong>
              </div>
              <div className={styles.metricStrip}>
                <span>Success Rate</span>
                <strong>{stats.successRate}%</strong>
              </div>
              <div className={styles.metricStrip}>
                <span>Total Submissions</span>
                <strong>{stats.totalSubmissions} Runs</strong>
              </div>
            </div>

          </div>

          {/* Activity Graph Section */}
          <div className={styles.dashboardSection}>
            <ActivityHeatmap submissions={submissions} />
          </div>

          {/* Performance Analytics SVG Charts */}
          <div className={styles.chartsGrid}>
            <LineChart 
              data={stats.runtimeHistory} 
              title="Runtime History" 
              strokeColor="#22c55e" 
              unit="ms" 
            />
            <LineChart 
              data={stats.memoryHistory} 
              title="Memory Usage" 
              strokeColor="#3b82f6" 
              unit="MB" 
            />
            <DoughnutChart 
              data={stats.languageUsageData} 
              title="Language Usage" 
            />
            <BarChart 
              data={stats.frequencyData} 
              title="Submission Frequency" 
              barColor="#8b5cf6" 
            />
          </div>

          {/* Latest Submissions and Bookmarks */}
          <div className={styles.bottomDashboardGrid}>
            
            {/* Latest Submissions */}
            <div className={styles.bottomListCard}>
              <h3>Latest Submissions</h3>
              <div className={styles.activityList}>
                {stats.recentSubmissions.map((sub) => (
                  <div key={sub._id} className={styles.activityRow}>
                    <div className={styles.rowLeft}>
                      <span className={`${styles.verdictDot} ${sub.verdict === 'Accepted' ? styles.pass : styles.fail}`} />
                      <div className={styles.activityMeta}>
                        <Link to={`/submission/${sub._id}`} className={styles.activityProblemTitle}>
                          {sub.title}
                        </Link>
                        <span>{sub.language} • {sub.runtime || '0 ms'}</span>
                      </div>
                    </div>
                    <div className={styles.rowRight}>
                      <span className={styles.activityDate}>
                        {new Date(sub.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
                {stats.recentSubmissions.length === 0 && (
                  <div className={styles.emptyListMsg}>No submissions made yet</div>
                )}
              </div>
            </div>

            {/* Bookmarked Problems */}
            <div className={styles.bottomListCard}>
              <h3>Bookmarked Problems</h3>
              <div className={styles.activityList}>
                {bookmarks.map((bm) => (
                  <div key={bm._id} className={styles.activityRow}>
                    <div className={styles.rowLeft}>
                      <FiBookmark className={styles.bookmarkListIcon} />
                      <div className={styles.activityMeta}>
                        <Link to={`/practice/${bm.titleSlug}`} className={styles.activityProblemTitle}>
                          {bm.title}
                        </Link>
                        <span>Revisit later</span>
                      </div>
                    </div>
                  </div>
                ))}
                {bookmarks.length === 0 && (
                  <div className={styles.emptyListMsg}>No bookmarked problems found</div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;