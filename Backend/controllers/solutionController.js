const Solution = require('../model/solution');
const Question = require('../model/question');
const Notification = require('../model/notification');
const axios = require('axios');

// Base64 encoding/decoding helper utilities
const encodeBase64 = (str) => {
  if (!str) return "";
  return Buffer.from(str.toString()).toString('base64');
};

const decodeBase64 = (str) => {
  if (!str) return "";
  return Buffer.from(str, 'base64').toString('utf-8');
};

// Map languages to Judge0 language IDs
const mapLanguageToId = (lang) => {
  const l = lang.toLowerCase();
  if (l === 'c') return 50;
  if (l === 'cpp' || l === 'c++') return 54;
  if (l === 'java') return 62;
  if (l === 'python' || l === 'python3') return 71;
  if (l === 'javascript' || l === 'js') return 63;
  return 63; // fallback to Javascript
};

// Poll Judge0 batch submissions
const runCodeOnJudge0 = async (submissions) => {
  try {
    const response = await axios.post(
      'https://ce.judge0.com/submissions/batch?base64_encoded=true',
      { submissions },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const tokens = response.data.map(item => item.token);
    const tokensStr = tokens.join(',');

    let attempts = 0;
    const maxAttempts = 15;
    let completed = false;
    let results = [];

    while (attempts < maxAttempts && !completed) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;

      const statusRes = await axios.get(
        `https://ce.judge0.com/submissions/batch?tokens=${tokensStr}&base64_encoded=true`
      );

      results = statusRes.data.submissions || [];
      const allFinished = results.every(
        sub => sub.status_id !== 1 && sub.status_id !== 2
      );

      if (allFinished) {
        completed = true;
      }
    }

    return results;
  } catch (error) {
    console.error('Judge0 Batch Execution Error:', error.message);
    throw error;
  }
};

const checkAndCreateAchievements = async (userId, username, questionTitle) => {
  try {
    const acceptedSubmissions = await Solution.find({ userId, verdict: 'Accepted' });
    const uniqueSolved = new Set(acceptedSubmissions.map(sub => sub.titleSlug));
    const solvedCount = uniqueSolved.size;

    if (solvedCount === 1) {
      await new Notification({
        userId,
        type: 'Achievement',
        title: 'Achievement Unlocked: First Solved!',
        message: `Congratulations ${username}! You solved your very first problem: "${questionTitle}". Welcome to ZCoder!`
      }).save();
    } else if (solvedCount === 10 || solvedCount === 50 || solvedCount === 100) {
      await new Notification({
        userId,
        type: 'Achievement',
        title: `Achievement Unlocked: ${solvedCount} Solved!`,
        message: `Amazing job! You have successfully solved ${solvedCount} unique problems on ZCoder.`
      }).save();
    }

    const dates = acceptedSubmissions
      .map(sub => new Date(sub.createdAt).toDateString())
      .filter((val, idx, self) => self.indexOf(val) === idx)
      .map(d => new Date(d))
      .sort((a, b) => b - a);

    let currentStreak = 0;
    if (dates.length > 0) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let lastDate = dates[0];
      lastDate.setHours(0,0,0,0);

      if (lastDate.getTime() === today.getTime() || lastDate.getTime() === yesterday.getTime()) {
        currentStreak = 1;
        for (let i = 1; i < dates.length; i++) {
          const prevDate = new Date(lastDate);
          prevDate.setDate(prevDate.getDate() - 1);
          const currentDate = dates[i];
          currentDate.setHours(0,0,0,0);

          if (currentDate.getTime() === prevDate.getTime()) {
            currentStreak++;
            lastDate = currentDate;
          } else {
            break;
          }
        }
      }
    }

    if (currentStreak === 3) {
      const exist = await Notification.findOne({ userId, title: 'Achievement Unlocked: 3-Day Streak!' });
      if (!exist) {
        await new Notification({
          userId,
          type: 'Achievement',
          title: 'Achievement Unlocked: 3-Day Streak!',
          message: `Keep it up! You've maintained a 3-day coding streak.`
        }).save();
      }
    } else if (currentStreak === 7) {
      const exist = await Notification.findOne({ userId, title: 'Achievement Unlocked: 7-Day Streak!' });
      if (!exist) {
        await new Notification({
          userId,
          type: 'Achievement',
          title: 'Achievement Unlocked: 7-Day Streak!',
          message: `Incredible dedication! You are on a 7-day coding streak.`
        }).save();
      }
    }
  } catch (err) {
    console.error('Error generating achievements:', err);
  }
};

const postSolution = async (req, res) => {
  const { userId, titleSlug, title, solution, language, username, topicTags} = req.body;
  try {
    const newSolution = new Solution({ userId, titleSlug, title, solution, language, username, topicTags});
    if(newSolution.solution){
      await newSolution.save();
      res.status(201).json({ msg: 'Solution posted successfully' });
    } else {
      res.status(300).json({ msg: 'Nothing is posted' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getSolutionsByTitleSlug = async (req, res) => {
  const { titleSlug } = req.params;
  try {
    const solutions = await Solution.find({ titleSlug }).populate('userId');
    res.status(200).json(solutions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getUserSubmissions = async (req,res) =>{
  const {userId} = req.params;
  try {
    console.log(userId);
    const solutions = await Solution.find({ userId });
    console.log(solutions);
    res.status(200).json(solutions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteSolution = async (req, res) => {
  const { solutionId } = req.params;
  try {
    const solution = await Solution.findByIdAndDelete(solutionId);
    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }
    res.status(200).json({ message: 'Solution deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /user/solutions/:titleSlug/run - Run code on sample or custom inputs
const runSolution = async (req, res) => {
  const { titleSlug } = req.params;
  const { language, sourceCode, customInput } = req.body;

  try {
    const question = await Question.findOne({ titleSlug });
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const languageId = mapLanguageToId(language);

    let testcases = [];
    if (customInput !== undefined && customInput !== null && customInput.trim() !== '') {
      testcases.push({
        input: customInput,
        output: ''
      });
    } else {
      testcases = question.sampleTestCases || [];
      if (testcases.length === 0) {
        testcases.push({ input: '', output: '' });
      }
    }

    const submissions = testcases.map(tc => ({
      source_code: encodeBase64(sourceCode),
      language_id: languageId,
      stdin: encodeBase64(tc.input),
      expected_output: tc.output ? encodeBase64(tc.output) : null
    }));

    const results = await runCodeOnJudge0(submissions);

    const formattedResults = results.map((resItem, index) => {
      const statusId = resItem.status_id;
      let verdict = 'Internal Error';
      if (statusId === 3) verdict = 'Accepted';
      else if (statusId === 4) verdict = 'Wrong Answer';
      else if (statusId === 5) verdict = 'Time Limit Exceeded';
      else if (statusId === 6) verdict = 'Compilation Error';
      else if (statusId >= 7 && statusId <= 12) verdict = 'Runtime Error';

      return {
        verdict,
        status: resItem.status ? resItem.status.description : verdict,
        stdout: resItem.stdout ? decodeBase64(resItem.stdout) : '',
        stderr: resItem.stderr ? decodeBase64(resItem.stderr) : '',
        compile_output: resItem.compile_output ? decodeBase64(resItem.compile_output) : '',
        time: resItem.time ? `${Math.round(parseFloat(resItem.time) * 1000)} ms` : '0 ms',
        memory: resItem.memory ? `${Math.round(parseFloat(resItem.memory) / 1024)} KB` : '0 KB',
        input: testcases[index].input,
        expected_output: testcases[index].output
      };
    });

    res.status(200).json({ results: formattedResults });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /user/solutions/:titleSlug/submit - Run code on all testcases, assign verdict, save to MongoDB
const submitSolution = async (req, res) => {
  const { titleSlug } = req.params;
  const { userId, username, language, sourceCode } = req.body;

  try {
    const question = await Question.findOne({ titleSlug });
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const languageId = mapLanguageToId(language);

    // Combine sample and hidden testcases
    const testcases = [
      ...(question.sampleTestCases || []),
      ...(question.hiddenTestCases || [])
    ];

    if (testcases.length === 0) {
      testcases.push({ input: '', output: '' });
    }

    const submissions = testcases.map(tc => ({
      source_code: encodeBase64(sourceCode),
      language_id: languageId,
      stdin: encodeBase64(tc.input),
      expected_output: tc.output ? encodeBase64(tc.output) : null
    }));

    const results = await runCodeOnJudge0(submissions);

    let finalVerdict = 'Accepted';
    let maxRuntimeMs = 0;
    let maxMemoryKb = 0;
    let firstFailedResult = null;

    const formattedResults = results.map((resItem, index) => {
      const statusId = resItem.status_id;
      let verdict = 'Internal Error';
      if (statusId === 3) verdict = 'Accepted';
      else if (statusId === 4) verdict = 'Wrong Answer';
      else if (statusId === 5) verdict = 'Time Limit Exceeded';
      else if (statusId === 6) verdict = 'Compilation Error';
      else if (statusId >= 7 && statusId <= 12) verdict = 'Runtime Error';

      // Parse time and memory usage
      const timeMs = resItem.time ? Math.round(parseFloat(resItem.time) * 1000) : 0;
      const memKb = resItem.memory ? Math.round(parseFloat(resItem.memory)) : 0;

      if (timeMs > maxRuntimeMs) maxRuntimeMs = timeMs;
      if (memKb > maxMemoryKb) maxMemoryKb = memKb;

      if (verdict !== 'Accepted' && finalVerdict === 'Accepted') {
        finalVerdict = verdict;
        firstFailedResult = {
          verdict,
          status: resItem.status ? resItem.status.description : verdict,
          stdout: resItem.stdout ? decodeBase64(resItem.stdout) : '',
          stderr: resItem.stderr ? decodeBase64(resItem.stderr) : '',
          compile_output: resItem.compile_output ? decodeBase64(resItem.compile_output) : '',
          input: testcases[index].input,
          expected_output: testcases[index].output
        };
      }

      return {
        verdict,
        status: resItem.status ? resItem.status.description : verdict,
        stdout: resItem.stdout ? decodeBase64(resItem.stdout) : '',
        stderr: resItem.stderr ? decodeBase64(resItem.stderr) : '',
        compile_output: resItem.compile_output ? decodeBase64(resItem.compile_output) : '',
        time: `${timeMs} ms`,
        memory: `${Math.round(memKb / 1024)} MB`,
        input: testcases[index].input,
        expected_output: testcases[index].output
      };
    });

    const runtime = `${maxRuntimeMs} ms`;
    const memory = `${Math.round(maxMemoryKb / 1024)} MB`;

    const passedCount = formattedResults.filter(r => r.verdict === 'Accepted').length;
    const totalCount = formattedResults.length;

    // Save submission to MongoDB
    const newSolution = new Solution({
      userId,
      username,
      titleSlug,
      title: question.title,
      solution: sourceCode,
      language,
      topicTags: question.topicTags || [],
      verdict: finalVerdict,
      runtime,
      memory,
      difficulty: question.difficulty || 'Medium',
      passedCount,
      totalCount,
      results: formattedResults
    });

    await newSolution.save();

    // Create a Notification for this submission
    try {
      const isAccepted = finalVerdict === 'Accepted';
      const notification = new Notification({
        userId,
        type: isAccepted ? 'Accepted' : 'WrongAnswer',
        title: isAccepted ? 'Accepted Submission' : `Submission - ${finalVerdict}`,
        message: isAccepted
          ? `Congratulations! Your solution for "${question.title}" was accepted (${runtime}, ${memory}).`
          : `Your solution for "${question.title}" returned ${finalVerdict} on testcase ${passedCount + 1}/${totalCount}.`
      });
      await notification.save();

      // Trigger achievement check asynchronously
      if (isAccepted) {
        checkAndCreateAchievements(userId, username, question.title);
      }
    } catch (notifErr) {
      console.error('Error creating submission notification:', notifErr);
    }

    res.status(200).json({
      verdict: finalVerdict,
      runtime,
      memory,
      results: formattedResults,
      failedTestcase: firstFailedResult,
      solutionId: newSolution._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSolutionById = async (req, res) => {
  const { solutionId } = req.params;
  try {
    const solution = await Solution.findById(solutionId).populate('userId');
    if (!solution) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    const question = await Question.findOne({ titleSlug: solution.titleSlug });
    res.status(200).json({ solution, question });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  postSolution,
  getSolutionsByTitleSlug,
  getUserSubmissions,
  deleteSolution,
  runSolution,
  submitSolution,
  getSolutionById
};
