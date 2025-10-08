const mongoose = require('mongoose');

const keyPointerSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String }
}, { _id: false });

const aboutSchema = new mongoose.Schema({
  mainHeading: { type: String, required: true },
  mainDescription: { type: String, required: true },
  topRightDescription: { type: String, required: true },
  keyPointers: [keyPointerSchema],
  centerImage: { type: String }, // Cloudinary URL
  rightImage: { type: String }, // Cloudinary URL
}, { timestamps: true });

module.exports = mongoose.model('About', aboutSchema);
