const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeResume, bulkScreenResumes, getJobApplications, sendSelectionEmails } = require('../controllers/screeningController');
const { protect } = require('../middleware/authMiddleware');

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Routes
router.post('/analyze', protect, upload.single('resume'), analyzeResume);
router.post('/:jobId/bulk-screen', protect, upload.array('resumes', 100), bulkScreenResumes);
router.get('/:jobId/applications', protect, getJobApplications);
router.post('/:jobId/send-emails', protect, sendSelectionEmails);

module.exports = router;
