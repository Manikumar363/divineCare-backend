const ContactPage = require('../models/ContactPage');

// GET contact page content
exports.getContactPage = async (req, res) => {
  try {
    // Assuming only one document exists
    const content = await ContactPage.findOne();
    if (!content) return res.status(404).json({ message: 'Contact page content not found' });
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contact page content', error });
  }
};

// PUT update contact page content
exports.updateContactPage = async (req, res) => {
  try {
    // Assuming only one document exists
    const content = await ContactPage.findOne();
    if (!content) return res.status(404).json({ message: 'Contact page content not found' });
    let updateFields = req.body;
    if (req.file) {
      const { v4: uuidv4 } = require('uuid');
      const { uploadToAntryk } = require('../utils/cloudinaryHelper');
      const key = `contact-page/${uuidv4()}_${req.file.originalname}`;
      const uploadResult = await uploadToAntryk(req.file, key);
      updateFields.imageKey = uploadResult.key;
    }
    Object.assign(content, updateFields);
    await content.save();
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: 'Error updating contact page content', error });
  }
};
