const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({});

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];
const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  const isValidExtension = allowedExtensions.includes(ext);
  const isValidMime = allowedMimeTypes.includes(file.mimetype);

  if (!isValidExtension && !isValidMime) {
    return cb(new Error('Solo se permiten imágenes'), false);
  }

  cb(null, true);
};

module.exports = multer({ storage, fileFilter });
