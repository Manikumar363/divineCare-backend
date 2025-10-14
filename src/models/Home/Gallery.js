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
    url: { type: String, required: true },
    public_id: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Gallery', GallerySchema);
