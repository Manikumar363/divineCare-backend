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
    type: String, // Antryk file URL
    required: false
  },
  image1Key: {
    type: String // Antryk object key
  },
  image2: {
    type: String, // Antryk file URL
    required: false
  },
  image2Key: {
    type: String // Antryk object key
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);