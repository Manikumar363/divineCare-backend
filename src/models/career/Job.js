const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  contactNumber: { type: String },
  address: { type: String },
  resume: { type: String }, // secure_url
  resumePublicId: { type: String },
  coverLetter: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  shortDescription: { type: String },
  description: { type: String },
  location: { type: String },
  experience: { type: String },
  salary: { type: String },
  openings: { type: Number, default: 1 },
  postedAt: { type: Date, default: Date.now },
  responsibilities: [String],
  keySkills: [String],
  applicants: [applicantSchema]
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
