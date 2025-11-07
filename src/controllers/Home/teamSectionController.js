const TeamSection = require('../../models/Home/TeamSection');
const { uploadToAntryk, deleteFromAntryk } = require('../../utils/cloudinaryHelper');

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
    
    // Handle image upload to Antryk
    let imageKey = '';
    if (image || req.file) {
      const { v4: uuidv4 } = require('uuid');
      const imageData = req.file || image;
      const key = `team/${uuidv4()}_${imageData.originalname || 'image'}`;
      const uploadResult = await uploadToAntryk(imageData, key);
      imageKey = uploadResult.key;
    }
    section.members.push({ 
      imageKey,
      fullName, 
      designation 
    });
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
    
    const memberIndex = section.members.findIndex(member => member._id.toString() === req.params.memberId);
    if (memberIndex === -1) return res.status(404).json({ success: false, message: 'Team member not found' });
    
    // Delete image from Antryk before removing member
    const member = section.members[memberIndex];
    if (member.imageKey) {
      const { deleteFromAntryk } = require('../../utils/cloudinaryHelper');
      try {
        await deleteFromAntryk(member.imageKey);
      } catch (err) {
        console.error('Failed to delete image from Antryk:', err.message);
      }
    }

    section.members.splice(memberIndex, 1);
    await section.save();
    res.status(200).json({ success: true, section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
