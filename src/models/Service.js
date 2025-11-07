const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  shortDescription: {
    type: String,
    required: true,
    trim: true
  },
  detailedDescription: {
    type: String,
    required: true
  },
  image1: {
    type: String, // Cloudinary secure_url
    required: false
  },
  image1PublicId: {
    type: String // Cloudinary public_id for deletion
  },
  image2: {
    type: String, // Cloudinary secure_url
    required: false
  },
  image2PublicId: {
    type: String // Cloudinary public_id for deletion
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);