const MainAbout = require('../../models/About/mainAbout');

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
    let updateData = { ...req.body };
    if (req.file) {
      const { v4: uuidv4 } = require('uuid');
      const { uploadToAntryk } = require('../../utils/cloudinaryHelper');
      const key = `main-about/${uuidv4()}_${req.file.originalname}`;
      const uploadResult = await uploadToAntryk(req.file, key);
      updateData.imageKey = uploadResult.key;
    }
    const about = await MainAbout.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!about) return res.status(404).json({ success: false, message: 'Main About section not found' });
    res.status(200).json({ success: true, about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
