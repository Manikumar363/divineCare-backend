const express = require('express');
const router = express.Router();
const contactPageController = require('../controllers/contactPageController');
const { protect, adminOnly } = require('../middleware/auth');

// GET contact page content (public)
router.get('/', contactPageController.getContactPage);

const upload = require('../middleware/multer');
// PUT update contact page content (admin only)
router.put('/', protect, adminOnly, upload.single('image'), contactPageController.updateContactPage);

module.exports = router;
