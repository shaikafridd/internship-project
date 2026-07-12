const express = require('express');
const { getMyCourses, getMyCourseById, toggleLessonComplete } = require('../controllers/myCourseController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router.get('/', getMyCourses);
router.get('/:courseId', getMyCourseById);
router.post('/:courseId/lessons/:lessonId/complete', toggleLessonComplete);

module.exports = router;
