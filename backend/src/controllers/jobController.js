const SavedJob = require('../models/SavedJob');
const JobApplication = require('../models/JobApplication');
const User = require('../models/User');

// Helper to compute relative time from unix timestamp
const getRelativeTimeString = (timestamp) => {
  const diffMs = Date.now() - (timestamp * 1000);
  const diffMins = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return `1 day ago`;
  return `${diffDays} days ago`;
};

// Helper to generate a mockup salary LPA based on title
const estimateSalary = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('senior') || lower.includes('lead') || lower.includes('manager')) {
    return '₹ 12 - 18 LPA';
  }
  if (lower.includes('junior') || lower.includes('intern')) {
    return '₹ 3 - 6 LPA';
  }
  if (lower.includes('developer') || lower.includes('engineer') || lower.includes('analyst')) {
    return '₹ 6 - 10 LPA';
  }
  return '₹ 5 - 8 LPA'; // Default
};

// @desc    Get live jobs from Arbeitnow with optional query filters
// @route   GET /api/jobs
// @access  Private (or Public, but we require protect if we want isSaved)
exports.getJobs = async (req, res, next) => {
  try {
    const { search, location, jobType } = req.query;

    // Fetch from Arbeitnow
    const response = await fetch('https://www.arbeitnow.com/api/job-board-api');
    if (!response.ok) {
      throw new Error('Failed to fetch from live jobs API');
    }
    const apiData = await response.json();
    let jobs = apiData.data || [];

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      jobs = jobs.filter(j => 
        j.title.toLowerCase().includes(searchLower) ||
        j.company_name.toLowerCase().includes(searchLower) ||
        (j.description && j.description.toLowerCase().includes(searchLower)) ||
        (j.tags && j.tags.some(t => t.toLowerCase().includes(searchLower)))
      );
    }

    if (location) {
      const locLower = location.toLowerCase();
      jobs = jobs.filter(j => j.location.toLowerCase().includes(locLower));
    }

    if (jobType) {
      const typeLower = jobType.toLowerCase();
      jobs = jobs.filter(j => {
        if (typeLower === 'remote' && j.remote) return true;
        if (typeLower === 'full-time' && !j.remote) return true;
        return false;
      });
    }

    // Get list of saved job slugs for the user to mark isSaved
    let savedSlugs = [];
    if (req.user) {
      const savedJobs = await SavedJob.find({ user: req.user.id }).select('slug');
      savedSlugs = savedJobs.map(s => s.slug);
    }

    // Format jobs
    const formattedJobs = jobs.map(j => {
      // Clean tags (remove duplicates or empty, ensure they have some default tags if empty)
      let tags = j.tags || [];
      if (tags.length === 0) {
        if (j.title.toLowerCase().includes('react')) tags = ['React', 'JavaScript', 'Tailwind CSS'];
        else if (j.title.toLowerCase().includes('design')) tags = ['Figma', 'UI Design', 'Prototyping'];
        else if (j.title.toLowerCase().includes('node')) tags = ['Node.js', 'Express.js', 'MongoDB'];
        else tags = ['Tech', 'Development'];
      }

      return {
        slug: j.slug,
        title: j.title,
        company: j.company_name,
        location: j.location,
        remote: j.remote,
        jobType: j.remote ? 'Remote' : 'Full-time',
        salary: estimateSalary(j.title),
        tags: tags,
        postedDate: getRelativeTimeString(j.created_at),
        isSaved: savedSlugs.includes(j.slug),
        description: j.description,
        url: j.url,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedJobs.length,
      data: formattedJobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Toggle saving a job (save / unsave)
// @route   POST /api/jobs/save/:slug
// @access  Private
exports.toggleSaveJob = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { title, company, location, tags } = req.body;

    const savedJob = await SavedJob.findOne({ user: req.user.id, slug });

    if (savedJob) {
      await savedJob.deleteOne();
      return res.status(200).json({
        success: true,
        message: 'Job removed from saved list',
        isSaved: false,
      });
    }

    if (!title || !company || !location) {
      return res.status(400).json({
        success: false,
        message: 'To save a job, please provide title, company, and location in the request body',
      });
    }

    const newSave = await SavedJob.create({
      user: req.user.id,
      slug,
      title,
      company,
      location,
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      isSaved: true,
      data: newSave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user's saved jobs list
// @route   GET /api/jobs/saved
// @access  Private
exports.getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await SavedJob.find({ user: req.user.id });
    res.status(200).json({
      success: true,
      count: savedJobs.length,
      data: savedJobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Apply for a job (Wizard Submission)
// @route   POST /api/jobs/apply
// @access  Private
exports.applyJob = async (req, res, next) => {
  try {
    const { jobSlug, title, company, salaryRange, resumeUrl, coverLetterUrl, additionalAnswers } = req.body;

    // Check if user already applied to this job
    const alreadyApplied = await JobApplication.findOne({ user: req.user.id, jobSlug });
    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job',
      });
    }

    // Create Application
    const application = await JobApplication.create({
      user: req.user.id,
      jobSlug,
      title,
      company,
      salaryRange: salaryRange || estimateSalary(title),
      resumeUrl,
      coverLetterUrl: coverLetterUrl || '',
      additionalAnswers: additionalAnswers || {},
      status: 'Applied',
    });

    // Update user activity log
    const user = await User.findById(req.user.id);
    user.activityLog.push({
      text: `Applied for ${title} at ${company}`,
      date: new Date(),
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get submitted applications
// @route   GET /api/jobs/applications
// @access  Private
exports.getApplications = async (req, res, next) => {
  try {
    const applications = await JobApplication.find({ user: req.user.id });
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
