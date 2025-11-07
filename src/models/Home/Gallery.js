const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    url: { type: String, required: true }, // Antryk URL
    key: { type: String } // Antryk object key
  }]
}, { timestamps: true });

module.exports = mongoose.model('Gallery', GallerySchema);
