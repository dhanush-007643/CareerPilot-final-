const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { applyForJob, getMyApplications, getJobApplications, updateStatus, getAtsBoard, inviteFresher, acceptInvitation } = require('../controllers/applicationController');

router.post('/',                   protect, authorize('fresher'), applyForJob);
router.get('/my',                  protect, authorize('fresher'), getMyApplications);
router.get('/job/:jobId',          protect, authorize('startup'), getJobApplications);
router.patch('/:id/status',        protect, authorize('startup'), updateStatus);
router.get('/ats/:jobId',          protect, authorize('startup'), getAtsBoard);
router.post('/invite',             protect, authorize('startup'), inviteFresher);
router.post('/:id/accept-invite',  protect, authorize('fresher'), acceptInvitation);

module.exports = router;
