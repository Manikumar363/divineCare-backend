const express = require('express');
const { submitContactForm } = require('../controllers/contactController');
const router = express.Router();

const upload = require('../middleware/multer');
// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', upload.single('image'), submitContactForm);

module.exports = router;