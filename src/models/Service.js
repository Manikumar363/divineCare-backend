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
    type: String, // URL or path to the image
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);