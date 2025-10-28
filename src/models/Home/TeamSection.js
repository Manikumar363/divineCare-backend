const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  image: { type: String, required: true }, // Cloudinary secure_url
  imagePublicId: { type: String }, // Cloudinary public_id for deletion
  fullName: { type: String, required: true },
  designation: { type: String, required: true }
}, { _id: true });

const teamSectionSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  description: { type: String, required: true },
  members: [teamMemberSchema]
}, { timestamps: true });

module.exports = mongoose.model('TeamSection', teamSectionSchema);
