const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  duration: {
    type: String, // format "MM:SS" or "HH:MM:SS"
    required: true,
  },
  videoUrl: {
    type: String,
    default: 'https://www.w3schools.com/html/mov_bbb.mp4', // Demo video
  },
});

const SectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  lessons: [LessonSchema],
});

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
  },
  instructor: {
    type: String,
    required: [true, 'Please add an instructor name'],
    default: 'CareerHub',
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Development', 'Design', 'Marketing', 'Data Science', 'Cloud Computing'],
  },
  image: {
    type: String, // URL/Path to image
    default: 'default_course.png',
  },
  duration: {
    type: String, // Total duration description, e.g. "4h 30m"
    required: true,
  },
  lessonsCount: {
    type: Number,
    default: 0,
  },
  sections: [SectionSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Course', CourseSchema);
