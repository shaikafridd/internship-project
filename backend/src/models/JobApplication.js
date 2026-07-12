const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true,
  },
  company: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true,
  },
  jobSlug: {
    type: String,
    required: true,
  },
  salaryRange: {
    type: String,
    default: '',
  },
  resumeUrl: {
    type: String,
    required: true,
  },
  coverLetterUrl: {
    type: String,
    default: '',
  },
  additionalAnswers: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Shortlisted', 'Rejected'],
    default: 'Applied',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('JobApplication', JobApplicationSchema);
