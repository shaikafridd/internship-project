const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Exclude password from query results by default
  },
  phone: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', ''],
    default: '',
  },
  dob: {
    type: Date,
  },
  aboutMe: {
    type: String,
    default: '',
  },
  skills: {
    type: [String],
    default: [],
  },
  atsSkills: {
    type: [String],
    default: [],
  },
  atsTopMatch: {
    role: { type: String, default: '' },
    score: { type: Number, default: 0 },
  },
  atsResults: [
    {
      Role: { type: String },
      'ATS Score': { type: Number },
      'Matched Skills': { type: [String] },
      'Missing Skills': { type: [String] }
    }
  ],
  atsFeedback: {
    type: String,
    default: '',
  },
  photoUrl: {
    type: String,
    default: '',
  },
  achievements: [
    {
      title: { type: String, required: true },
      date: { type: Date, default: Date.now }
    }
  ],
  activityLog: [
    {
      text: { type: String, required: true },
      date: { type: Date, default: Date.now }
    }
  ],
  education: [
    {
      degree: { type: String, default: '' },
      school: { type: String, default: '' },
      year: { type: String, default: '' },
      grade: { type: String, default: '' }
    }
  ],
  experience: [
    {
      role: { type: String, default: '' },
      company: { type: String, default: '' },
      duration: { type: String, default: '' },
      description: { type: String, default: '' }
    }
  ],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, {
  timestamps: true,
});

// Encrypt password using bcryptjs
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
