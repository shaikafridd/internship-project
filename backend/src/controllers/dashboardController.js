const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const JobApplication = require('../models/JobApplication');
const Task = require('../models/Task');
const SavedJob = require('../models/SavedJob');

// @desc    Get dashboard metrics and active data
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Fetch counts/stats
    const enrolledCoursesCount = await Enrollment.countDocuments({ user: userId });
    const certificatesCount = await Enrollment.countDocuments({ user: userId, status: 'completed' });
    const applicationsCount = await JobApplication.countDocuments({ user: userId });

    // Dynamic counts from database
    const savedJobsCount = await SavedJob.countDocuments({ user: userId });
    const messagesCount = 0;

    // 2. Continue Learning: Get user's most recent active enrollment
    const continueLearningEnrollment = await Enrollment.findOne({ user: userId, status: 'active' })
      .sort({ updatedAt: -1 })
      .populate('course');

    // 3. Upcoming Tasks
    const upcomingTasks = await Task.find({ user: userId })
      .sort({ dueDate: 1 })
      .limit(5);

    // 4. Recent Job Applications
    const recentApplications = await JobApplication.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // 5. Recommended Courses: Get courses the user is NOT enrolled in yet
    // Fetch all enrolled course IDs
    const enrolledCourses = await Enrollment.find({ user: userId }).select('course');
    const enrolledIds = enrolledCourses.map(e => e.course.toString());

    // Fetch recommended courses (excluding currently enrolled ones)
    const recommendedCourses = await Course.find({ _id: { $nin: enrolledIds } })
      .limit(4);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          enrolledCourses: enrolledCoursesCount,
          certificates: certificatesCount,
          applications: applicationsCount,
          savedJobs: savedJobsCount,
          messages: messagesCount,
        },
        continueLearning: continueLearningEnrollment,
        upcomingTasks: upcomingTasks.map(t => {
          // Format date response nicely for UI display
          const diffTime = Math.abs(t.dueDate - new Date());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          let dueString = '';
          if (t.dueDate < new Date()) {
            dueString = 'Overdue';
          } else if (diffDays === 1) {
            dueString = 'Due tomorrow';
          } else {
            dueString = `Due in ${diffDays} days`;
          }

          return {
            _id: t._id,
            title: t.title,
            dueDate: t.dueDate,
            dueString,
            status: t.status,
          };
        }),
        recentApplications,
        recommendedCourses,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
