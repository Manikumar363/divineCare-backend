const mongoose = require('mongoose');

const homeEventSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true } // Cloudinary URL
}, { timestamps: true });

module.exports = mongoose.model('HomeEvent', homeEventSchema);
