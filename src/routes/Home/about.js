const express = require('express');
const router = express.Router();
const { getAbout, updateAbout } = require('../../controllers/Home/aboutController');
const { protect, adminOnly } = require('../../middleware/auth');

// GET about section data
router.get('/', getAbout);


const upload = require('../../middleware/multer');
// PUT update about section
router.put('/:id', protect, adminOnly, upload.single('image'), updateAbout);



module.exports = router;