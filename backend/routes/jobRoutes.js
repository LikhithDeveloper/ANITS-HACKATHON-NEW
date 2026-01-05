const express = require('express');
const router = express.Router();
const { createJob, getMyJobs, getJobById } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createJob)
  .get(protect, getMyJobs);

router.route('/:id')
  .get(protect, getJobById);

module.exports = router;
