const Quiz = require('../models/Quiz');
const User = require('../models/User');

// @desc  Get all quizzes (sanitized, no correct answers)
// @route GET /api/quizzes
exports.getQuizzes = async (req, res) => {
  const quizzes = await Quiz.find().select('title category duration passMark questions._id questions.questionText questions.options');
  res.json({ success: true, count: quizzes.length, data: quizzes });
};

// @desc  Submit quiz answers and grade
// @route POST /api/quizzes/submit
exports.submitQuiz = async (req, res) => {
  const { quizId, answers } = req.body; // answers: { questionId: selectedOption }
  if (!quizId || !answers)
    return res.status(400).json({ success: false, message: 'quizId and answers required' });

  const quiz = await Quiz.findById(quizId);
  if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

  let correct = 0;
  quiz.questions.forEach((q) => {
    const userAns = (answers[q._id.toString()] || '').toLowerCase().trim();
    if (userAns === q.correctAnswer.toLowerCase().trim()) correct++;
  });

  const score = Math.round((correct / quiz.questions.length) * 100);
  const passed = score >= quiz.passMark;

  // Update user's highest assessment score
  if (passed) {
    const user = await User.findById(req.user._id);
    if (score > (user.assessmentScore || 0)) {
      user.assessmentScore = score;
      await user.save();
    }
  }

  const verificationCode = `CP-${Date.now()}-${req.user._id.toString().slice(-4).toUpperCase()}`;

  res.json({
    success: true,
    data: {
      score,
      passed,
      correct,
      total: quiz.questions.length,
      quizTitle: quiz.title,
      verificationCode: passed ? verificationCode : null,
    },
  });
};
