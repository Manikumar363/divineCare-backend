const express = require('express');
const router = express.Router();
const {getCompanyAbout, updateCompanyAbout} = require('../../controllers/About/companyAboutController');
const {protect, adminOnly} = require('../../middleware/auth');

// GET company about section data
router.get('/', getCompanyAbout);

// PUT update company about section data
const upload = require('../../middleware/multer');
router.put('/:id', protect, adminOnly, upload.single('image'), updateCompanyAbout);


module.exports = router;
