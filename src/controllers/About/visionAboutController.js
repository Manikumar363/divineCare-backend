const VisionAbout = require('../../models/about/visionAbout');

// GET vision about section data
exports.getVisionAbout = async (req, res) => {
  try {
    const vision = await VisionAbout.findOne();
    res.status(200).json({ success: true, vision });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update vision about section data
exports.updateVisionAbout = async (req, res) => {
  try {
    const vision = await VisionAbout.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!vision) return res.status(404).json({ success: false, message: 'Vision About section not found' });
    res.status(200).json({ success: true, vision });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
