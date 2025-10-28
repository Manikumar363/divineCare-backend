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
  image: {
    type: String, // Cloudinary secure_url
    required: false
  },
  imagePublicId: {
    type: String // Cloudinary public_id for deletion
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);