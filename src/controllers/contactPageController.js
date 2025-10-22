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
    const updateFields = req.body;
    Object.assign(content, updateFields);
    await content.save();
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: 'Error updating contact page content', error });
  }
};
