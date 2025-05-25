const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/uploadController');
const upload = require('../middlewares/upload');

router.post('/', upload.single('image'), uploadImage);

module.exports = router;
