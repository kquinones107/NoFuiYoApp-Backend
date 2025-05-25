const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
    return cb(new Error('Solo se permiten imágenes'), false);
  }
  cb(null, true);
};

module.exports = multer({ storage, fileFilter });
