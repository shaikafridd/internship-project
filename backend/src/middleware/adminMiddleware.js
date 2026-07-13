const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// ─────────────────────────────────────────────
// Middleware: verify admin JWT token
// Attaches decoded admin info to req.admin
// ─────────────────────────────────────────────
const verifyAdminToken = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: No admin token provided',
    });
  }

  try {
    // NOTE: JWT_SECRET must be set in backend/.env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure the token was issued for an admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Not an admin token',
      });
    }

    // Verify the admin record still exists in DB
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: Admin not found',
      });
    }

    req.admin = { id: admin._id, username: admin.username, role: 'admin' };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: Invalid or expired token',
    });
  }
};

module.exports = { verifyAdminToken };
