const express = require('express');
const { getJobs, toggleSaveJob, getSavedJobs, applyJob, getApplications } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { validateApplyJob } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getJobs);
router.post('/save/:slug', toggleSaveJob);
router.get('/saved', getSavedJobs);
router.post('/apply', validateApplyJob, applyJob);
router.get('/applications', getApplications);

module.exports = router;
