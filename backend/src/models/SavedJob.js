const mongoose = require('mongoose');

const SavedJobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

// A user can only save a specific job once
SavedJobSchema.index({ user: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('SavedJob', SavedJobSchema);
