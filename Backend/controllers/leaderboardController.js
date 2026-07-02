const User = require('../model/user');
const Solution = require('../model/solution');
const Question = require('../model/question');

let cachedLeaderboard = null;
let cacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const calculateStreak = (acceptedSubmissions) => {
  if (!acceptedSubmissions || acceptedSubmissions.length === 0) return 0;

  // Extract unique dates as strings (toDateString)
  const uniqueDates = acceptedSubmissions
    .map(sub => new Date(sub.createdAt).toDateString())
    .filter((val, idx, self) => self.indexOf(val) === idx)
    .map(d => new Date(d))
    .sort((a, b) => b - a); // descending order (latest first)

  if (uniqueDates.length === 0) return 0;

  const today = new Date();
  today.setHours(0,0,0,0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let lastDate = uniqueDates[0];
  lastDate.setHours(0,0,0,0);

  // If the last solve date is not today and not yesterday, streak is broken (0)
  if (lastDate.getTime() !== today.getTime() && lastDate.getTime() !== yesterday.getTime()) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(lastDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const currentDate = uniqueDates[i];
    currentDate.setHours(0,0,0,0);

    if (currentDate.getTime() === prevDate.getTime()) {
      streak++;
      lastDate = currentDate;
    } else {
      break;
    }
  }

  return streak;
};

const getLeaderboard = async (req, res) => {
  try {
    const now = Date.now();
    if (cachedLeaderboard && cacheTime && (now - cacheTime < CACHE_DURATION)) {
      return res.status(200).json(cachedLeaderboard);
    }

    const users = await User.find({}, 'username email');
    const questions = await Question.find({}, 'titleSlug difficulty');
    const difficultyMap = new Map(questions.map(q => [q.titleSlug, q.difficulty]));

    const leaderboardData = [];

    for (const user of users) {
      const submissions = await Solution.find({ userId: user._id });
      
      const totalSubmissions = submissions.length;
      const acceptedSubmissions = submissions.filter(s => s.verdict === 'Accepted');
      
      const uniqueSolvedSlugs = new Set(acceptedSubmissions.map(s => s.titleSlug));
      const solvedCount = uniqueSolvedSlugs.size;
      
      let easySolved = 0;
      let mediumSolved = 0;
      let hardSolved = 0;
      let score = 0;

      uniqueSolvedSlugs.forEach(slug => {
        const diff = difficultyMap.get(slug) || 'Medium';
        if (diff === 'Easy') {
          easySolved++;
          score += 10;
        } else if (diff === 'Hard') {
          hardSolved++;
          score += 30;
        } else {
          mediumSolved++;
          score += 20;
        }
      });

      const acceptanceRate = totalSubmissions > 0 
        ? parseFloat(((acceptedSubmissions.length / totalSubmissions) * 100).toFixed(2))
        : 0;

      const currentStreak = calculateStreak(acceptedSubmissions);

      leaderboardData.push({
        userId: user._id,
        username: user.username,
        solved: solvedCount,
        solvedBreakdown: {
          easy: easySolved,
          medium: mediumSolved,
          hard: hardSolved
        },
        acceptanceRate,
        streak: currentStreak,
        score
      });
    }

    // Sort by score descending, then solved count descending, then username
    leaderboardData.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.solved !== a.solved) return b.solved - a.solved;
      return a.username.localeCompare(b.username);
    });

    // Assign rank
    const rankedData = leaderboardData.map((item, index) => ({
      rank: index + 1,
      ...item
    }));

    cachedLeaderboard = rankedData;
    cacheTime = now;

    res.status(200).json(rankedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getLeaderboard
};
