import React, { useEffect, useState } from 'react';
import './Contests.css';

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback contest data in case API fails
  const fallbackContests = [
    {
      id: 1,
      event: "LeetCode Weekly Contest #395",
      href: "https://leetcode.com/contest/weekly-contest-395",
      start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      duration: 5400 // 1.5 hours
    },
    {
      id: 2,
      event: "Codeforces Round #950 (Div. 3)",
      href: "https://codeforces.com/contest/1980",
      start: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
      duration: 7200 // 2 hours
    },
    {
      id: 3,
      event: "HackerRank Weekly Challenge",
      href: "https://www.hackerrank.com/contests/weekly-challenge",
      start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      duration: 3600 // 1 hour
    },
    {
      id: 4,
      event: "AtCoder Beginner Contest #350",
      href: "https://atcoder.jp/contests/abc350",
      start: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
      duration: 6000 // 1.67 hours
    },
    {
      id: 5,
      event: "Google Kick Start Round G",
      href: "https://codingcompetitions.withgoogle.com/kickstart",
      start: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days from now
      duration: 10800 // 3 hours
    },
    {
      id: 6,
      event: "TopCoder SRM 850",
      href: "https://www.topcoder.com/community/arena",
      start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      duration: 4500 // 1.25 hours
    },
    {
      id: 7,
      event: "LeetCode Biweekly Contest #120",
      href: "https://leetcode.com/contest/biweekly-contest-120",
      start: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days from now
      duration: 5400 // 1.5 hours
    },
    {
      id: 8,
      event: "CodeChef Starters 120",
      href: "https://www.codechef.com/START120",
      start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      duration: 7200 // 2 hours
    },
    {
      id: 9,
      event: "HackerEarth Monthly Challenge",
      href: "https://www.hackerearth.com/challenges/competitive",
      start: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days from now
      duration: 86400 // 24 hours
    },
    {
      id: 10,
      event: "SPOJ Contest Series",
      href: "https://www.spoj.com/contests",
      start: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
      duration: 18000 // 5 hours
    },
    {
      id: 11,
      event: "Codeforces Educational Round",
      href: "https://codeforces.com/contests",
      start: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(), // 11 days from now
      duration: 7200 // 2 hours
    },
    {
      id: 12,
      event: "LeetCode Weekly Contest #396",
      href: "https://leetcode.com/contest/weekly-contest-396",
      start: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      duration: 5400 // 1.5 hours
    },
    {
      id: 13,
      event: "AtCoder Regular Contest #180",
      href: "https://atcoder.jp/contests/arc180",
      start: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days from now
      duration: 7200 // 2 hours
    },
    {
      id: 14,
      event: "HackerRank 101 Hack",
      href: "https://www.hackerrank.com/101hack",
      start: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString(), // 13 days from now
      duration: 3600 // 1 hour
    },
    {
      id: 15,
      event: "CodeChef Long Challenge",
      href: "https://www.codechef.com/LTIME",
      start: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
      duration: 259200 // 72 hours
    }
  ];

  useEffect(() => {
    const fetchContests = async () => {
      const username = 'shraman1507';
      const apiKey = '738ba004d8e3e434774b366ec26692422912b96f';
      const currentDate = new Date().toISOString();
      
      // Try with CORS proxy first
      const corsProxyUrl = `https://cors-anywhere.herokuapp.com/https://clist.by/api/v1/contest/?username=${username}&api_key=${apiKey}&start__gt=${currentDate}&resource__id__in=1,2,102,93&limit=10`;

      try {
        const response = await fetch(corsProxyUrl, {
          method: 'GET',
          headers: {
            'Origin': 'http://localhost:5173'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setContests(data.objects || []);
      } catch (error) {
        console.log('API failed, using fallback data:', error.message);
        // If API fails, use fallback data
        setContests(fallbackContests);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  if (loading) {
    return (
      <div className="contests-container">
        <div className='loading'>Loading contests...</div>
      </div>
    );
  }

  if (error && contests.length === 0) {
    return (
      <div className="contests-container">
        <div className="error">Error loading contests: {error}</div>
        <div className="fallback-note">
          <p>Showing sample contest data. Please check your internet connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contests-container">
      <h1 className="heading">Upcoming Contests</h1>
      {contests.length === 0 ? (
        <div className="no-contests">
          <p>No upcoming contests found.</p>
        </div>
      ) : (
      <div className="container-box">
        <div className="list-container">
            {contests.map((contest) => (
              <li key={contest.id} className="list">
                <a href={contest.href} target="_blank" rel="noopener noreferrer" className="contest-link">
                  <h2>{contest.event}</h2>
                  <div className="contestInfo">
                    <div className="time">
                      <p>Start Time: {new Date(contest.start).toLocaleString()}</p>
                    </div>
                    <div className="duration">
                      <p>Duration: {Math.floor(contest.duration / 3600)} hours</p>
                    </div>
                  </div>   
                </a>
              </li>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Contests;