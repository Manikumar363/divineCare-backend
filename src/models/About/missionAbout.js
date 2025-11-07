const mongoose = require('mongoose');

const missionAboutSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true }, // Left Column Image (Antryk URL)
  imageKey: { type: String }, // Antryk object key for deletion
  points: [{ type: String, required: true }] // 4 mission points
}, { timestamps: true });

module.exports = mongoose.model('MissionAbout', missionAboutSchema);
