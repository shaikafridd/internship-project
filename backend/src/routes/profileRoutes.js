const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { validateProfileUpdate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getProfile);
router.put('/', validateProfileUpdate, updateProfile);

module.exports = router;
