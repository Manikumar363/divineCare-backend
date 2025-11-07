const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  shortDescription: { type: String },
  description: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  location: { type: String },
  venueDetails: { type: String },
  image: { type: String }, // Antryk file URL
  imageKey: { type: String }, // Antryk object key for deletion
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  registrations: [
    {
      firstName: { type: String, required: true },
      lastName: { type: String },
      email: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
