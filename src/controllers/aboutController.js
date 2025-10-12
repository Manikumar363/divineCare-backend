const About = require('../models/About');

// GET about section data
exports.getAbout = async (req, res) => {
  try {
    const about = await About.findOne();
    res.status(200).json({ success: true, about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update about section
exports.updateAbout = async (req, res) => {
  try {
    const about = await About.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!about) return res.status(404).json({ success: false, message: 'About section not found' });
    res.status(200).json({ success: true, about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

