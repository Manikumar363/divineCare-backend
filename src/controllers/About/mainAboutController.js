const MainAbout = require('../../models/about/mainAbout');

// GET main about section data
exports.getMainAbout = async (req, res) => {
  try {
    const about = await MainAbout.findOne();
    res.status(200).json({ success: true, about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update main about section data
exports.updateMainAbout = async (req, res) => {
  try {
    const about = await MainAbout.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!about) return res.status(404).json({ success: false, message: 'Main About section not found' });
    res.status(200).json({ success: true, about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
