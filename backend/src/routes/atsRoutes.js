const express = require('express');
const { analyzeResume } = require('../controllers/atsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/analyze', protect, analyzeResume);

module.exports = router;
