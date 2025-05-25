const Home = require('../models/Home');
const User = require('../models/User');

// Crear una casa
const createHome = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  try {
    const { nanoid } = await import('nanoid'); // 👈 CORRECCIÓN aquí
    const code = nanoid(6); // Código único de 6 caracteres

    const newHome = await Home.create({
      name,
      code,
      members: [userId]
    });

    await User.findByIdAndUpdate(userId, {
      home: newHome._id,
      isAdmin: true
    });

    res.status(201).json({ message: 'Hogar creado', home: newHome });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear hogar', error: err });
  }
};

// Unirse a una casa existente
const joinHome = async (req, res) => {
  const { code } = req.params;
  const userId = req.user.id;

  try {
    const home = await Home.findOne({ code });
    if (!home) return res.status(404).json({ message: 'Código de hogar no encontrado' });

    if (!home.members.includes(userId)) {
      home.members.push(userId);
      await home.save();
      await User.findByIdAndUpdate(userId, { home: home._id });
    }

    res.status(200).json({ message: 'Te uniste al hogar', home });
  } catch (err) {
    res.status(500).json({ message: 'Error al unirse al hogar', error: err });
  }
};

// Ver miembros de la casa
const getHomeMembers = async (req, res) => {
  const user = await User.findById(req.user.id).populate('home');

  if (!user.home) return res.status(400).json({ message: 'No perteneces a un hogar' });

  const home = await Home.findById(user.home._id).populate('members', 'name email');

  res.status(200).json({ members: home.members });
};

const getMyHomes = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate('home');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const homes = await Home.find({ members: userId }).sort({ createdAt: -1 });

    res.status(200).json({ homes });
  } catch (err) {
    res.status(500).json({ message: 'Error al cargar hogares', error: err });
  }
};


module.exports = { createHome, joinHome, getHomeMembers, getMyHomes };
