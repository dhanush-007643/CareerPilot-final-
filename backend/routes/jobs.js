const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getJobs, getJob, createJob, updateJob, deleteJob, getMyJobs } = require('../controllers/jobController');

router.get('/',    protect, getJobs);
router.get('/my',  protect, authorize('startup'), getMyJobs);
router.get('/:id', protect, getJob);
router.post('/',   protect, authorize('startup'), createJob);
router.put('/:id', protect, authorize('startup'), updateJob);
router.delete('/:id', protect, authorize('startup'), deleteJob);

module.exports = router;
