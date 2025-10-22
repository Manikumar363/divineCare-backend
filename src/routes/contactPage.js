const express = require('express');
const router = express.Router();
const contactPageController = require('../controllers/contactPageController');
const { protect, adminOnly } = require('../middleware/auth');

// GET contact page content (public)
router.get('/', contactPageController.getContactPage);

// PUT update contact page content (admin only)
router.put('/', protect, adminOnly, contactPageController.updateContactPage);

module.exports = router;
