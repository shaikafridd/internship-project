const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const JobApplication = require('../models/JobApplication');
const SavedJob = require('../models/SavedJob');

// @desc    Get logged in user profile with stats and activity logs
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Dynamic stats computation
    const enrolledCount = await Enrollment.countDocuments({ user: req.user.id });
    const certificatesCount = await Enrollment.countDocuments({ user: req.user.id, status: 'completed' });
    const applicationsCount = await JobApplication.countDocuments({ user: req.user.id });
    const savedJobsCount = await SavedJob.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        gender: user.gender,
        dob: user.dob,
        aboutMe: user.aboutMe,
        skills: user.skills,
        atsSkills: user.atsSkills,
        atsTopMatch: user.atsTopMatch,
        atsResults: user.atsResults,
        atsFeedback: user.atsFeedback,
        photoUrl: user.photoUrl,
        education: user.education || [],
        experience: user.experience || [],
        achievements: user.achievements,
        activityLog: user.activityLog.sort((a, b) => b.date - a.date),
        stats: {
          coursesEnrolled: enrolledCount,
          certificatesEarned: certificatesCount,
          applicationsSubmitted: applicationsCount,
          jobsSaved: savedJobsCount,
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile details
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      phone: req.body.phone,
      location: req.body.location,
      gender: req.body.gender,
      dob: req.body.dob,
      aboutMe: req.body.aboutMe,
      skills: req.body.skills,
      photoUrl: req.body.photoUrl,
      education: req.body.education,
      experience: req.body.experience,
    };

    // Clean undefined fields to prevent overwriting with null
    Object.keys(fieldsToUpdate).forEach(
      key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
