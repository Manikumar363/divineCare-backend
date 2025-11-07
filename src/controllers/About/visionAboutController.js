const VisionAbout = require('../../models/About/visionAbout');

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
    let updateData = { ...req.body };
    if (req.file) {
      const { v4: uuidv4 } = require('uuid');
      const { uploadToAntryk } = require('../../utils/cloudinaryHelper');
      const key = `vision-about/${uuidv4()}_${req.file.originalname}`;
      const uploadResult = await uploadToAntryk(req.file, key);
      updateData.imageKey = uploadResult.key;
    }
    const vision = await VisionAbout.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!vision) return res.status(404).json({ success: false, message: 'Vision About section not found' });
    res.status(200).json({ success: true, vision });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
