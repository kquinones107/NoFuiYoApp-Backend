const SpecialDate = require('../models/SpecialDate');
const User = require('../models/User');

// Obtener todas las fechas especiales del hogar del usuario
const getDates = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.home) return res.status(400).json({ message: 'No perteneces a un hogar' });

    const dates = await SpecialDate.find({ home: user.home });
    res.status(200).json({ dates });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener fechas especiales', error });
  }
};

// Crear una nueva fecha especial
const createDate = async (req, res) => {
  const { title, date } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user.home) return res.status(400).json({ message: 'No perteneces a un hogar' });

    const newDate = await SpecialDate.create({
      title,
      date,
      home: user.home,
    });

    res.status(201).json({ message: 'Fecha creada', date: newDate });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear fecha especial', error });
  }
};

module.exports = { getDates, createDate };
