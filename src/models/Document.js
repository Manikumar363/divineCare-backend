const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String },
  description: { type: String },
  fileUrl: { type: String, required: true }, // Antryk file URL or external URL
  fileKey: { type: String }, // Antryk object key
  mimeType: { type: String },
  size: { type: Number },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
