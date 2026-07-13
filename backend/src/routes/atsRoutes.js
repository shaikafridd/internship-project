const express = require('express');
const multer = require('multer');
const { analyzeResume, saveAtsResults } = require('../controllers/atsController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.post('/analyze', protect, upload.single('file'), analyzeResume);
router.post('/save', protect, saveAtsResults);

module.exports = router;
