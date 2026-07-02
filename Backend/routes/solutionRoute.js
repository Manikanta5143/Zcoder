const express = require('express');
const { postSolution, getSolutionsByTitleSlug, getUserSubmissions, deleteSolution, runSolution, submitSolution, getSolutionById } = require('../controllers/solutionController');

const router = express.Router();

router.post('/solutions', postSolution);
router.get('/solutions/:titleSlug',getSolutionsByTitleSlug);
router.get('/solutions/byUser/:userId',getUserSubmissions);
router.get('/solutions/detail/:solutionId', getSolutionById);
router.delete('/solutions/:solutionId', deleteSolution);
router.post('/solutions/:titleSlug/run', runSolution);
router.post('/solutions/:titleSlug/submit', submitSolution);

module.exports = router;
