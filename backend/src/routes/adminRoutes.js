const express = require('express');
const {
  adminLogin,
  adminDashboard,
  getCoursesAdmin,
  createCourse,
  updateCourse,
  deleteCourse,
  getPaymentsAdmin,
  updatePaymentStatusAdmin,
  deletePaymentAdmin
} = require('../controllers/adminController');
const { verifyAdminToken } = require('../middleware/adminMiddleware');

const router = express.Router();

// Public: Admin login
router.post('/login', adminLogin);

// Protected: Admin dashboard data
router.get('/dashboard', verifyAdminToken, adminDashboard);

// Protected: Admin course management
router.get('/courses', verifyAdminToken, getCoursesAdmin);
router.post('/courses', verifyAdminToken, createCourse);
router.put('/courses/:id', verifyAdminToken, updateCourse);
router.delete('/courses/:id', verifyAdminToken, deleteCourse);

// Protected: Admin payment management
router.get('/payments', verifyAdminToken, getPaymentsAdmin);
router.put('/payments/:id', verifyAdminToken, updatePaymentStatusAdmin);
router.delete('/payments/:id', verifyAdminToken, deletePaymentAdmin);

module.exports = router;
