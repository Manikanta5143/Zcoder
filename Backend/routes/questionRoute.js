const express = require('express');
const {
  getQuestions,
  getQuestionBySlug,
  searchQuestions,
  getQuestionsByDifficulty,
  getTags
} = require('../controllers/questionController');

const router = express.Router();

router.get('/questions', getQuestions);
router.get('/questions/search', searchQuestions);
router.get('/questions/difficulty/:difficulty', getQuestionsByDifficulty);
router.get('/questions/tags', getTags);
router.get('/questions/:titleSlug', getQuestionBySlug);

module.exports = router;
