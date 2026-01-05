const Job = require('../models/Job');

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Recruiter)
const createJob = async (req, res) => {
  try {
    const {
      title,
      department,
      description,
      requirements,
      location,
      type,
      vacancies,
      experienceLevel,
      skills,
      recruitmentPhases
    } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    const job = await Job.create({
      recruiter: req.user.id,
      title,
      department,
      description,
      requirements,
      location,
      type,
      vacancies,
      experienceLevel,
      skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()), // Handle CSV or Array
      recruitmentPhases: recruitmentPhases || undefined, // Let mongoose default kick in if null
      status: 'Open'
    });

    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get recruiter's jobs
// @route   GET /api/jobs
// @access  Private
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Ensure user owns this job
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createJob,
  getMyJobs,
  getJobById
};
