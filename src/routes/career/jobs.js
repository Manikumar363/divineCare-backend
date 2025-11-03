const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyToJob
} = require('../../controllers/career/careerController');
const { protect, adminOnly } = require('../../middleware/auth');
const uploadResume = require('../../middleware/multerResume');

// Public: list jobs
router.get('/', getJobs);

// Public: get single job
router.get('/:id', getJobById);

// Admin: create job
router.post('/', protect, adminOnly, createJob);

// Admin: update job
router.put('/:id', protect, adminOnly, updateJob);

// Admin: delete job
router.delete('/:id', protect, adminOnly, deleteJob);

// Public: apply to job (file upload allowed)
router.post('/:id/apply', uploadResume.single('resume'), applyToJob);

module.exports = router;
