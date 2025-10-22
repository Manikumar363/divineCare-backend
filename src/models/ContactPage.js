const mongoose = require('mongoose');

const contactPageSchema = new mongoose.Schema({
  pageHeading: {
    type: String,
    required: true,
    trim: true
  },
  pageDescription: {
    type: String,
    required: true
  },
  googleMapsEmbedLink: {
    type: String,
    required: false
  },
  callUs: {
    serviceTitle: String,
    serviceSubtitle: String,
    phoneNumber1: String,
    phoneNumber2: String
  },
  mailInfo: {
    emailTitle: String,
    emailSubtitle: String,
    emailAddress1: String,
    emailAddress2: String
  },
  location: {
    addressTitle: String,
    addressSubtitle: String,
    fullAddress: String
  }
}, { timestamps: true });

module.exports = mongoose.model('ContactPage', contactPageSchema);
