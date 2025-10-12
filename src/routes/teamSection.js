const express = require('express');
const router = express.Router();
const { getTeamSection, addTeamMember, updateTeamSection, deleteTeamMember } = require('../controllers/teamSectionController');
const { protect, adminOnly } = require('../middleware/auth');

// GET team section data
router.get('/', protect, adminOnly, getTeamSection);

// POST add a new team member
router.post('/member', protect, adminOnly, addTeamMember);

// PUT update section info or a team member
router.put('/:id', protect, adminOnly, updateTeamSection);

// DELETE a team member
router.delete('/member/:memberId', protect, adminOnly, deleteTeamMember);

module.exports = router;
