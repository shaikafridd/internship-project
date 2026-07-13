const express = require('express');
const { adminLogin, adminDashboard } = require('../controllers/adminController');
const { verifyAdminToken } = require('../middleware/adminMiddleware');

const router = express.Router();

// Public: Admin login
// POST /api/admin/login
router.post('/login', adminLogin);

// Protected: Admin dashboard data
// GET /api/admin/dashboard
router.get('/dashboard', verifyAdminToken, adminDashboard);

module.exports = router;
