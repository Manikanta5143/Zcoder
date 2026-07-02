const Question = require('../model/question');

// GET /api/questions - List questions with pagination, filtering, search, and sorting
exports.getQuestions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 40,
      difficulty,
      tag,
      search,
      sortBy = 'title',
      sortOrder = 'asc'
    } = req.query;

    const query = {};

    // 1. Filtering by Difficulty
    if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      query.difficulty = difficulty;
    }

    // 2. Filtering by Topic Tag Name (case-insensitive)
    if (tag) {
      query['topicTags.name'] = { $regex: new RegExp(`^${tag}$`, 'i') };
    }

    // 3. Search by keyword (title-only regex match for responsive partial queries)
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // 4. Calculate pagination skip
    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    // 5. Build sort options
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
    } else {
      sort.title = 1; // default sort
    }

    // 6. Projection: Exclude heavy fields from list query for performance
    const projection = 'title titleSlug difficulty category topicTags acceptanceRate likes dislikes';

    // 7. Execute query
    const questions = await Question.find(query)
      .select(projection)
      .sort(sort)
      .skip(skip)
      .limit(parsedLimit);

    const total = await Question.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit),
      questions
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Internal server error while retrieving questions.' });
  }
};

// GET /api/questions/:titleSlug - Get single question detail
exports.getQuestionBySlug = async (req, res) => {
  try {
    const { titleSlug } = req.params;
    const question = await Question.findOne({ titleSlug });

    if (!question) {
      return res.status(404).json({ error: `Question with slug '${titleSlug}' not found.` });
    }

    res.status(200).json(question);
  } catch (error) {
    console.error('Error fetching single question:', error);
    res.status(500).json({ error: 'Internal server error while retrieving question details.' });
  }
};

// GET /api/questions/search - Search questions autocomplete
exports.searchQuestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(200).json([]);
    }

    const questions = await Question.find({
      title: { $regex: q, $options: 'i' }
    })
      .select('title titleSlug difficulty')
      .limit(10);

    res.status(200).json(questions);
  } catch (error) {
    console.error('Error searching questions:', error);
    res.status(500).json({ error: 'Internal server error during search query.' });
  }
};

// GET /api/questions/difficulty/:difficulty - Get questions filtered by difficulty
exports.getQuestionsByDifficulty = async (req, res) => {
  try {
    const { difficulty } = req.params;
    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty parameter.' });
    }

    const questions = await Question.find({ difficulty })
      .select('title titleSlug difficulty topicTags acceptanceRate')
      .sort({ title: 1 });

    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions by difficulty:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// GET /api/questions/tags - Get all distinct topic tags in database
exports.getTags = async (req, res) => {
  try {
    const tags = await Question.distinct('topicTags.name');
    res.status(200).json(tags);
  } catch (error) {
    console.error('Error retrieving tags:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
