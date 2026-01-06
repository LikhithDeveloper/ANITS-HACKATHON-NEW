const mongoose = require('mongoose');

const jobSchema = mongoose.Schema({
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Please add a job title']
  },
  department: {
    type: String,
    required: [true, 'Please add a department']
  },
  description: {
    type: String,
    required: [true, 'Please add a job description']
  },
  requirements: {
    type: String,
    required: [true, 'Please add job requirements']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    default: 'Full-time'
  },
  vacancies: {
    type: Number,
    required: [true, 'Please add number of vacancies'],
    default: 1
  },
  experienceLevel: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Draft'],
    default: 'Open'
  },
  skills: {
    type: [String], // Array of strings
    required: true
  },
  recruitmentPhases: {
    type: [String],
    default: ['Screening', 'Technical Interview', 'HR Interview', 'Offer']
  },
  deadline: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
