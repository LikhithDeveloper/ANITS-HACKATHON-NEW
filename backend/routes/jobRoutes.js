const express = require('express');
const router = express.Router();
const { createJob, getMyJobs, getJobById, updateJobStatus } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createJob)
  .get(protect, getMyJobs);

router.route('/:id')
  .get(protect, getJobById);

router.put('/:id/status', protect, updateJobStatus);

module.exports = router;
