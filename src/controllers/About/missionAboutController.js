const MissionAbout = require('../../models/About/missionAbout');

// GET mission about section data
exports.getMissionAbout = async (req, res) => {
  try {
    const mission = await MissionAbout.findOne();
    res.status(200).json({ success: true, mission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update mission about section data
exports.updateMissionAbout = async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (req.file) {
      const { v4: uuidv4 } = require('uuid');
      const { uploadToAntryk } = require('../../utils/cloudinaryHelper');
      const key = `mission-about/${uuidv4()}_${req.file.originalname}`;
      const uploadResult = await uploadToAntryk(req.file, key);
      updateData.imageKey = uploadResult.key;
    }
    const mission = await MissionAbout.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!mission) return res.status(404).json({ success: false, message: 'Mission About section not found' });
    res.status(200).json({ success: true, mission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
