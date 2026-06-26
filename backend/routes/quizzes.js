const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getQuizzes, submitQuiz } = require('../controllers/quizController');

router.get('/',       protect, getQuizzes);
router.post('/submit', protect, authorize('fresher'), submitQuiz);

module.exports = router;
