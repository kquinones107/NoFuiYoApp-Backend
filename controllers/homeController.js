const Home = require('../models/Home');
const User = require('../models/User');
const { getOrCreateUserByClerkId } = require('../utils/getOrCreateUser');

// Crear una casa
const createHome = async (req, res) => {
  const { name } = req.body;
  const clerkUserId = req.clerkUserId;

  try {
    // 1) Mapear Clerk -> User interno (Mongo)
    const user = await getOrCreateUserByClerkId(clerkUserId);

    const { nanoid } = await import('nanoid');
    const code = nanoid(6);

    const newHome = await Home.create({
      name,
      code,
      members: [user._id], // 👈 aquí debe ir el _id de Mongo
    });

    await User.findByIdAndUpdate(user._id, {
      home: newHome._id,
      isAdmin: true,
    });

    res.status(201).json({ message: 'Hogar creado', home: newHome });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear hogar', error: err });
  }
};

// Unirse a una casa existente
const joinHome = async (req, res) => {
  const { code } = req.params;
  const clerkUserId = req.clerkUserId;

  try {
    const user = await getOrCreateUserByClerkId(clerkUserId);

    const home = await Home.findOne({ code });
    if (!home) return res.status(404).json({ message: 'Código de hogar no encontrado' });

    const userObjectId = user._id.toString();
    const memberIds = home.members.map((m) => m.toString());

    if (!memberIds.includes(userObjectId)) {
      home.members.push(user._id);
      await home.save();
      await User.findByIdAndUpdate(user._id, { home: home._id });
    }

    res.status(200).json({ message: 'Te uniste al hogar', home });
  } catch (err) {
    res.status(500).json({ message: 'Error al unirse al hogar', error: err });
  }
};

// Ver miembros de la casa
const getHomeMembers = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;
    const user = await getOrCreateUserByClerkId(clerkUserId);

    const userWithHome = await User.findById(user._id).populate('home');

    if (!userWithHome.home) {
      return res.status(400).json({ message: 'No perteneces a un hogar' });
    }

    const members = await User.find({ home: userWithHome.home._id }).select('name email');

    const homeDetails = await Home.findById(userWithHome.home._id).select('name code');

    res.status(200).json({ home: homeDetails, members });
  } catch (error) {
    console.error('Error al obtener miembros del hogar:', error);
    res.status(500).json({ message: 'Error al obtener miembros del hogar', error });
  }
};

const getMyHomes = async (req, res) => {
  const clerkUserId = req.clerkUserId;

  try {
    const user = await getOrCreateUserByClerkId(clerkUserId);

    const homes = await Home.find({ members: user._id }).sort({ createdAt: -1 });

    res.status(200).json({ homes });
  } catch (err) {
    res.status(500).json({ message: 'Error al cargar hogares', error: err });
  }
};

module.exports = { createHome, joinHome, getHomeMembers, getMyHomes };