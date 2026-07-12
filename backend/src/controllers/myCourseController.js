const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Get logged in user's enrolled courses
// @route   GET /api/my-courses
// @access  Private (protect middleware)
exports.getMyCourses = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate({
        path: 'course',
        select: 'title instructor image duration lessonsCount category',
      });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get specific enrolled course details with progress
// @route   GET /api/my-courses/:courseId
// @access  Private (protect middleware)
exports.getMyCourseById = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId,
    }).populate('course');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'You are not enrolled in this course or course not found',
      });
    }

    res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Toggle completion of a lesson in an enrolled course
// @route   POST /api/my-courses/:courseId/lessons/:lessonId/complete
// @access  Private (protect middleware)
exports.toggleLessonComplete = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;

    // 1. Find enrollment
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'You are not enrolled in this course',
      });
    }

    // 2. Find course to get total lessons count
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Find if lesson exists in the course
    let lessonExists = false;
    for (const section of course.sections) {
      if (section.lessons.some(l => l.id === lessonId)) {
        lessonExists = true;
        break;
      }
    }

    if (!lessonExists) {
      return res.status(400).json({
        success: false,
        message: 'Lesson ID does not exist in this course',
      });
    }

    // 3. Toggle lesson in completedLessons array
    const index = enrollment.completedLessons.indexOf(lessonId);
    let isCompleted = false;

    if (index === -1) {
      enrollment.completedLessons.push(lessonId);
      isCompleted = true;
    } else {
      enrollment.completedLessons.splice(index, 1);
    }

    // 4. Recalculate progress percentage
    // Total lessons is either course.lessonsCount or computed from sections
    let totalLessons = 0;
    course.sections.forEach(section => {
      totalLessons += section.lessons.length;
    });
    
    if (totalLessons === 0) {
      totalLessons = course.lessonsCount || 1; // Fallback
    }

    const progressPercent = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
    enrollment.progress = Math.min(progressPercent, 100);

    // Update status if 100% complete
    enrollment.status = enrollment.progress === 100 ? 'completed' : 'active';

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: isCompleted ? 'Lesson marked as completed' : 'Lesson marked as incomplete',
      data: {
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons,
        status: enrollment.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
