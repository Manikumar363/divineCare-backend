const mongoose = require('mongoose');

const homeSchema = new mongoose.Schema({
  heroImage: { type: String }, // Antryk URL
  heroImageKey: { type: String }, // Antryk object key
  heroTitle: { type: String, required: true },
  heroHeading: { type: String, required: true },
  description: { type: String, required: true },
  facebookUrl: { type: String },
  instagramUrl: { type: String },
  xUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Home', homeSchema);
