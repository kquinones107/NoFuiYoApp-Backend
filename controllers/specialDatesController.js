const SpecialDate = require('../models/SpecialDate');
const User = require('../models/User');
const { getOrCreateUserByClerkId } = require('../utils/getOrCreateUser');

// Obtener todas las fechas especiales del hogar del usuario
const getDates = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;

    // 1) Usuario interno por Clerk
    const internalUser = await getOrCreateUserByClerkId(clerkUserId);

    // 2) Validar hogar
    const user = await User.findById(internalUser._id);
    if (!user?.home) return res.status(400).json({ message: 'No perteneces a un hogar' });

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
    const clerkUserId = req.clerkUserId;

    const internalUser = await getOrCreateUserByClerkId(clerkUserId);
    const user = await User.findById(internalUser._id);

    if (!user?.home) return res.status(400).json({ message: 'No perteneces a un hogar' });

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