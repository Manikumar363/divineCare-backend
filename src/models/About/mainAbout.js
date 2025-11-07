const mongoose = require('mongoose');

const mainAboutSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  smallDescription: { type: String, required: true },
  mainDescription: { type: String, required: true },
  images: [{ type: String, required: true }], // [leftImage1, leftImage2, rightMainImage] (Antryk URLs)
  imageKeys: [{ type: String }], // Antryk object keys for deletion
  keyPoints: [{ type: String, required: true }], // 3 bullet points
}, { timestamps: true });

module.exports = mongoose.model('MainAbout', mainAboutSchema);
