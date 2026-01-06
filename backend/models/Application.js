const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Job'
  },
  resumePath: {
    type: String,
    required: true
  },
  candidateName: {
    type: String,
    default: 'Unknown Candidate'
  },
  candidateEmail: {
    type: String
  },
  aiAnalysis: {
    matchScore: Number,
    matchStatus: String,
    summary: String,
    missingSkills: Object,
    resumeImprovements: [String],
    learningPlan: [Object]
  },
  interviewGuidance: {
    type: String // Stores the generated Markdown
  },
  rejectionFeedback: {
    type: String // Stores the detailed rejection analysis
  },
  status: {
    type: String,
    enum: ['Applied', 'Screened', 'Interview', 'Rejected', 'Hired'],
    default: 'Screened'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);
