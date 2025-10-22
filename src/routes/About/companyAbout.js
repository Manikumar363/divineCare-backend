const express = require('express');
const router = express.Router();
const {getCompanyAbout, updateCompanyAbout} = require('../../controllers/About/companyAboutController');
const {protect, adminOnly} = require('../../middleware/auth');

// GET company about section data
router.get('/', getCompanyAbout);

// PUT update company about section data
router.put('/:id', protect, adminOnly, updateCompanyAbout);


module.exports = router;
