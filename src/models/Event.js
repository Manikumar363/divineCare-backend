const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  shortDescription: { type: String },
  description: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  location: { type: String },
  venueDetails: { type: String },
  image: { type: String }, // Single Cloudinary URL
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
