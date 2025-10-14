const TeamSection = require('../../models/Home/TeamSection');

// GET all team section data
exports.getTeamSection = async (req, res) => {
  try {
    const section = await TeamSection.findOne();
    res.status(200).json({ success: true, section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST add a new team member
exports.addTeamMember = async (req, res) => {
  try {
    const { image, fullName, designation } = req.body;
    const section = await TeamSection.findOne();
    if (!section) return res.status(404).json({ success: false, message: 'Team section not found' });
    section.members.push({ image, fullName, designation });
    await section.save();
    res.status(201).json({ success: true, section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT update section info or a team member
exports.updateTeamSection = async (req, res) => {
  try {
    const section = await TeamSection.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!section) return res.status(404).json({ success: false, message: 'Team section not found' });
    res.status(200).json({ success: true, section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE a team member
exports.deleteTeamMember = async (req, res) => {
  try {
    const section = await TeamSection.findOne();
    if (!section) return res.status(404).json({ success: false, message: 'Team section not found' });
    section.members.id(req.params.memberId).remove();
    await section.save();
    res.status(200).json({ success: true, section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
