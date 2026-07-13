const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  loginAdmin,
  setupAdmin,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/admin/login', loginAdmin);
router.post('/admin/setup', setupAdmin);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
