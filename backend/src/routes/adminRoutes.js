const express = require('express');
const multer = require('multer');
const {
  adminLogin,
  adminDashboard,
  getCoursesAdmin,
  createCourse,
  updateCourse,
  deleteCourse,
  getPaymentsAdmin,
  updatePaymentStatusAdmin,
  deletePaymentAdmin,
  getUsersAdmin,
  deleteUserAdmin,
  uploadVideoAdmin
} = require('../controllers/adminController');
const { verifyAdminToken } = require('../middleware/adminMiddleware');

const upload = multer({ limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB limit

const router = express.Router();

// Public: Admin login
router.post('/login', adminLogin);

// Protected: Admin dashboard data
router.get('/dashboard', verifyAdminToken, adminDashboard);

// Protected: Admin user management
router.get('/users', verifyAdminToken, getUsersAdmin);
router.delete('/users/:id', verifyAdminToken, deleteUserAdmin);

// Protected: Admin video uploads (Cloudinary / Local static fallback)
router.post('/videos/upload', verifyAdminToken, upload.single('file'), uploadVideoAdmin);

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
