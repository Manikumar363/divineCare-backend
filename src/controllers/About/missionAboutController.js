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
    const mission = await MissionAbout.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!mission) return res.status(404).json({ success: false, message: 'Mission About section not found' });
    res.status(200).json({ success: true, mission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
