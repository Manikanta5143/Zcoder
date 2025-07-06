const express = require('express');
const { postSolution, getSolutionsByTitleSlug, getUserSubmissions, deleteSolution } = require('../controllers/solutionController');

const router = express.Router();

router.post('/solutions', postSolution);
router.get('/solutions/:titleSlug',getSolutionsByTitleSlug);
router.get('/solutions/byUser/:userId',getUserSubmissions);
router.delete('/solutions/:solutionId', deleteSolution);
module.exports = router;
