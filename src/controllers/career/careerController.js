const Job = require('../../models/career/Job');
const { uploadToAntryk, deleteFromAntryk } = require('../../utils/cloudinaryHelper');
const mongoose = require('mongoose');

// GET all jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedAt: -1 });
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single job by id
exports.getJobById = async (req, res) => {
  try {
    // Exclude applicants from the public job view for privacy
    const job = await Job.findById(req.params.id).select('-applicants');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET applicants for a job (admin only)
exports.getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).select('title applicants');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, applicants: job.applicants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST create job (admin)
exports.createJob = async (req, res) => {
  try {
    const job = new Job({ ...req.body });
    await job.save();
    res.status(201).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update job (admin)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE job (admin)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // delete applicant resumes from Antryk if present
    if (Array.isArray(job.applicants)) {
      for (const applicant of job.applicants) {
        if (applicant && applicant.resumeKey) {
          try {
            await deleteFromAntryk(applicant.resumeKey);
          } catch (err) {
            // log and continue
            console.error('Failed to delete applicant resume from Antryk:', err.message);
          }
        }
      }
    }

    // Use findByIdAndDelete to avoid issues with document methods in different mongoose versions
    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST apply to job (public)
exports.applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const { name, email, contactNumber, address, coverLetter, resume } = req.body;

    // handle resume upload: prefer req.file (multerResume) else resume (base64 or url)
    let resumeKey = '';
    if (req.file) {
      const { v4: uuidv4 } = require('uuid');
      const key = `job-applications/${uuidv4()}_${req.file.originalname}`;
      const uploadResult = await uploadToAntryk(req.file, key);
      resumeKey = uploadResult.key;
    } else if (resume) {
      // If resume is a URL or base64, you may want to handle accordingly
      resumeKey = resume;
    }

    const applicant = {
      _id: new mongoose.Types.ObjectId(),
      name,
      email,
      contactNumber,
      address,
      resumeKey,
      coverLetter
    };

    job.applicants.push(applicant);
    await job.save();

    res.status(201).json({ success: true, message: 'Application submitted', applicant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
