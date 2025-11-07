const express = require('express');
const router = express.Router();
const { getTeamSection, addTeamMember, updateTeamSection, deleteTeamMember } = require('../../controllers/Home/teamSectionController');
const { protect, adminOnly } = require('../../middleware/auth');
const upload = require('../../middleware/multer');

// GET team section data
router.get('/', getTeamSection);

// POST add a new team member
router.post('/member', protect, adminOnly, upload.single('image'), addTeamMember);

// PUT update section info or a team member
router.put('/:id', protect, adminOnly, upload.single('image'), updateTeamSection);

// DELETE a team member
router.delete('/member/:memberId', protect, adminOnly, deleteTeamMember);

module.exports = router;
