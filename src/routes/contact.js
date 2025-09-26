const express = require('express');
const { submitContactForm } = require('../controllers/contactController');
const router = express.Router();

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', submitContactForm);

module.exports = router;