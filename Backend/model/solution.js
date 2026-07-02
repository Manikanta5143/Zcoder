const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  titleSlug: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  solution: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default:[] }],
  topicTags: [
    {
      name: {
        type: String,
        required: true
      },
      slug: {
        type: String,
        required: true
      }
    }
  ],
  verdict: {
    type: String,
    default: "Accepted"
  },
  runtime: {
    type: String,
    default: "0 ms"
  },
  memory: {
    type: String,
    default: "0 KB"
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: "Medium"
  },
  passedCount: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 0
  },
  results: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  }
},{
  timestamps:true
});

// Indexes for rapid profile, submissions history, and leaderboard calculations
solutionSchema.index({ userId: 1, createdAt: -1 });
solutionSchema.index({ titleSlug: 1 });
solutionSchema.index({ userId: 1, titleSlug: 1, verdict: 1 });

const Solution = mongoose.model('Solution', solutionSchema);

module.exports = Solution;
