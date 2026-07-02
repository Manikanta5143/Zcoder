const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
  id: Number,
  inputText: String,
  outputText: String,
  explanation: String,
  img: String
});

const starterCodeSchema = new mongoose.Schema({
  lang: String,
  langSlug: String,
  code: String
});

const testCaseSchema = new mongoose.Schema({
  input: String,
  output: String
});

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  titleSlug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard'],
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  topicTags: [
    {
      name: { type: String, required: true },
      slug: { type: String, required: true }
    }
  ],
  description: {
    type: String,
    required: true
  },
  examples: [exampleSchema],
  constraints: [String],
  hints: [String],
  companies: [String],
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  acceptanceRate: {
    type: Number,
    default: 50.0
  },
  starterCode: [starterCodeSchema],
  sampleTestCases: [testCaseSchema],
  hiddenTestCases: [testCaseSchema],
  timeLimit: {
    type: Number, // in ms
    default: 1000
  },
  memoryLimit: {
    type: Number, // in MB
    default: 256
  }
}, { timestamps: true });

// Text index for searching on title and description
questionSchema.index({ title: 'text', description: 'text' });

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
