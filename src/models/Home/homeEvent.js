const mongoose = require('mongoose');

const homeEventSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true }, // Antryk URL
  imageKey: { type: String }, // Antryk object key
}, { timestamps: true });

module.exports = mongoose.model('HomeEvent', homeEventSchema);
