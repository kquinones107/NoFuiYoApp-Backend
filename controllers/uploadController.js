const cloudinary = require('../config/cloudinary');

const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se envió ninguna imagen' });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'casa-en-orden'
    });

    res.status(200).json({ message: 'Imagen subida correctamente', url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: 'Error al subir imagen', error });
  }
};

module.exports = { uploadImage };
