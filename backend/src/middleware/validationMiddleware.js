const mongoose = require('mongoose');

const validateSignup = (req, res, next) => {
  const { name, email, password } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Please provide a valid name' });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Please provide an email address' });
  }

  if (!password) {
    return res.status(400).json({ success: false, message: 'Please provide a password' });
  }

  next();
};

const validateCheckout = (req, res, next) => {
  const { courseId, paymentMethod } = req.body;

  if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid course ID' });
  }

  const validMethods = ['UPI', 'Card', 'Net Banking', 'Wallets', 'EMI'];
  if (!paymentMethod || !validMethods.includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: `Payment method must be one of: ${validMethods.join(', ')}` });
  }

  next();
};

const validateVerifyPayment = (req, res, next) => {
  const { orderId, paymentStatus } = req.body;

  if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid order ID' });
  }

  const validStatuses = ['Completed', 'Failed'];
  if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
    return res.status(400).json({ success: false, message: 'Payment status must be Completed or Failed' });
  }

  next();
};

const validateApplyJob = (req, res, next) => {
  const { jobSlug, title, company, resumeUrl } = req.body;

  if (!jobSlug || typeof jobSlug !== 'string' || jobSlug.trim() === '') {
    return res.status(400).json({ success: false, message: 'Please provide a valid job slug' });
  }

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ success: false, message: 'Please provide a valid job title' });
  }

  if (!company || typeof company !== 'string' || company.trim() === '') {
    return res.status(400).json({ success: false, message: 'Please provide a valid company name' });
  }

  if (!resumeUrl || typeof resumeUrl !== 'string' || resumeUrl.trim() === '') {
    return res.status(400).json({ success: false, message: 'Please provide a valid resume file path' });
  }

  next();
};

const validateProfileUpdate = (req, res, next) => {
  const { phone, location, gender, dob, aboutMe, skills } = req.body;

  if (phone && typeof phone !== 'string') {
    return res.status(400).json({ success: false, message: 'Phone must be a string' });
  }

  if (location && typeof location !== 'string') {
    return res.status(400).json({ success: false, message: 'Location must be a string' });
  }

  if (gender && !['Male', 'Female', 'Other', ''].includes(gender)) {
    return res.status(400).json({ success: false, message: 'Gender must be Male, Female, Other, or empty string' });
  }

  if (dob && isNaN(Date.parse(dob))) {
    return res.status(400).json({ success: false, message: 'Please provide a valid Date of Birth' });
  }

  if (aboutMe && typeof aboutMe !== 'string') {
    return res.status(400).json({ success: false, message: 'Bio/About Me must be a string' });
  }

  if (skills && !Array.isArray(skills)) {
    return res.status(400).json({ success: false, message: 'Skills must be an array of strings' });
  }

  next();
};

module.exports = {
  validateSignup,
  validateLogin,
  validateCheckout,
  validateVerifyPayment,
  validateApplyJob,
  validateProfileUpdate,
};
