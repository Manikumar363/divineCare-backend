const mongoose = require('mongoose');

const tabSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }
}, { _id: false });

const visionAboutSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true }, // Mission & Vision Image (Antryk URL)
  imageKey: { type: String }, // Antryk object key for deletion
  tabs: [tabSchema] // Array of 3 tabs
}, { timestamps: true });

module.exports = mongoose.model('VisionAbout', visionAboutSchema);
