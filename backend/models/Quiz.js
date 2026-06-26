const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  category: String,
  duration: { type: Number, default: 30 }, // minutes
  passMark: { type: Number, default: 70 },
  questions: [{
    questionText: { type: String, required: true },
    options:      [String],
    correctAnswer:{ type: String, required: true },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
