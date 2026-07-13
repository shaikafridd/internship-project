const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// ─────────────────────────────────────────────
// Seed / bootstrap: create the default admin
// if one doesn't already exist.
// Called once on server startup from app.js.
// ─────────────────────────────────────────────
const seedAdmin = async () => {
  try {
    const existing = await Admin.findOne({ username: 'admin' });
    if (!existing) {
      await Admin.create({ username: 'admin', password: 'admin' });
      console.log('✅ Default admin user created (username: admin)');
    }
  } catch (err) {
    console.error('❌ Failed to seed admin user:', err.message);
  }
};

// Helper: sign JWT
const signToken = (id) => {
  // NOTE: Make sure JWT_SECRET is set in backend/.env
  // Example: JWT_SECRET=your_super_secret_key_here
  return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// ─────────────────────────────────────────────
// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
// ─────────────────────────────────────────────
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password',
      });
    }

    // Look up admin (include password field explicitly)
    const admin = await Admin.findOne({ username: username.toLowerCase().trim() }).select('+password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      });
    }

    // Compare submitted password against stored hash
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      });
    }

    const token = signToken(admin._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: admin._id,
        username: admin.username,
        role: 'admin',
      },
    });
  } catch (err) {
    console.error('Admin login error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during admin login',
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Protected admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Admin (requires verifyAdminToken middleware)
// ─────────────────────────────────────────────
exports.adminDashboard = async (req, res) => {
  try {
    // req.admin is set by verifyAdminToken middleware
    return res.status(200).json({
      success: true,
      message: 'Admin dashboard data loaded successfully',
      data: {
        adminId: req.admin.id,
        username: req.admin.username,
        role: 'admin',
        stats: {
          totalStudents: 12845,
          activeCourses: 5,
          totalEnrollments: 25671,
          totalRevenue: 1886995,
          pendingPayouts: 245300,
        },
        serverStatus: 'operational',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data',
    });
  }
};

module.exports.seedAdmin = seedAdmin;
