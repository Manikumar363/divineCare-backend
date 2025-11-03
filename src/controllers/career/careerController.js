const Job = require('../../models/career/Job');
const { uploadToCloudinary, deleteFromCloudinary } = require('../../utils/cloudinaryHelper');
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
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, job });
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

    // delete applicant resumes from cloudinary if present
    if (Array.isArray(job.applicants)) {
      for (const applicant of job.applicants) {
        if (applicant && applicant.resumePublicId) {
          try {
            await deleteFromCloudinary(applicant.resumePublicId);
          } catch (err) {
            // log and continue
            console.error('Failed to delete applicant resume from Cloudinary:', err.message);
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
    let resumeUrl = '';
    let resumePublicId = '';
    if (req.file || resume) {
      const resumeData = req.file || resume;
      const uploadResult = await uploadToCloudinary(resumeData, 'divinecare/job-applications');
      resumeUrl = uploadResult.secure_url;
      resumePublicId = uploadResult.public_id;
    }

    const applicant = {
      _id: new mongoose.Types.ObjectId(),
      name,
      email,
      contactNumber,
      address,
      resume: resumeUrl,
      resumePublicId,
      coverLetter
    };

    job.applicants.push(applicant);
    await job.save();

    res.status(201).json({ success: true, message: 'Application submitted', applicant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
