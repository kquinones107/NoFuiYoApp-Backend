const Home = require('../models/Home');
const User = require('../models/User');
const NeighborRequest = require('../models/NeighborRequest');
const HomeNeighbor = require('../models/HomeNeighbor');
const { getOrCreateUserByClerkId } = require('../utils/getOrCreateUser');

const getCurrentUserHome = async (clerkUserId) => {
  const user = await getOrCreateUserByClerkId(clerkUserId);
  const userWithHome = await User.findById(user._id).populate('home');

  if (!userWithHome.home) {
    throw new Error('Debes pertenecer a un hogar');
  }

  return {
    user,
    home: userWithHome.home,
  };
};

const normalizePair = (homeA, homeB) => {
  const a = homeA.toString();
  const b = homeB.toString();

  return a < b
    ? { homeA: a, homeB: b }
    : { homeA: b, homeB: a };
};

const searchHomeByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const { home: currentHome } = await getCurrentUserHome(req.clerkUserId);

    const foundHome = await Home.findOne({ code: code.trim().toUpperCase() }).select('name code createdAt');

    if (!foundHome) {
      return res.status(404).json({ message: 'No se encontró un hogar con ese código' });
    }

    if (foundHome._id.toString() === currentHome._id.toString()) {
      return res.status(400).json({ message: 'No puedes agregarte como vecino a tu propio hogar' });
    }

    res.status(200).json({ home: foundHome });
  } catch (err) {
    res.status(500).json({ message: 'Error al buscar hogar', error: err.message });
  }
};

const sendNeighborRequest = async (req, res) => {
  try {
    const { code } = req.body;
    const { home: currentHome } = await getCurrentUserHome(req.clerkUserId);

    if (!code || !code.trim()) {
      return res.status(400).json({ message: 'El código del hogar es requerido' });
    }

    const toHome = await Home.findOne({ code: code.trim().toUpperCase() });

    if (!toHome) {
      return res.status(404).json({ message: 'No se encontró un hogar con ese código' });
    }

    if (toHome._id.toString() === currentHome._id.toString()) {
      return res.status(400).json({ message: 'No puedes enviar solicitud a tu propio hogar' });
    }

    const pair = normalizePair(currentHome._id, toHome._id);

    const alreadyNeighbors = await HomeNeighbor.findOne(pair);

    if (alreadyNeighbors) {
      return res.status(400).json({ message: 'Estos hogares ya son vecinos' });
    }

    const existingRequest = await NeighborRequest.findOne({
      $or: [
        { fromHome: currentHome._id, toHome: toHome._id, status: 'pending' },
        { fromHome: toHome._id, toHome: currentHome._id, status: 'pending' },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Ya existe una solicitud pendiente entre estos hogares' });
    }

    const request = await NeighborRequest.create({
      fromHome: currentHome._id,
      toHome: toHome._id,
    });

    res.status(201).json({ message: 'Solicitud enviada correctamente', request });
  } catch (err) {
    res.status(500).json({ message: 'Error al enviar solicitud', error: err.message });
  }
};

const getNeighborRequests = async (req, res) => {
  try {
    const { home } = await getCurrentUserHome(req.clerkUserId);

    const requests = await NeighborRequest.find({
      toHome: home._id,
      status: 'pending',
    })
      .populate('fromHome', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (err) {
    res.status(500).json({ message: 'Error al cargar solicitudes', error: err.message });
  }
};

const acceptNeighborRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { home } = await getCurrentUserHome(req.clerkUserId);

    const request = await NeighborRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    if (request.toHome.toString() !== home._id.toString()) {
      return res.status(403).json({ message: 'No autorizado para aceptar esta solicitud' });
    }

    request.status = 'accepted';
    await request.save();

    const pair = normalizePair(request.fromHome, request.toHome);

    await HomeNeighbor.findOneAndUpdate(
      pair,
      pair,
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Solicitud aceptada. Ahora son hogares vecinos.' });
  } catch (err) {
    res.status(500).json({ message: 'Error al aceptar solicitud', error: err.message });
  }
};

const rejectNeighborRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { home } = await getCurrentUserHome(req.clerkUserId);

    const request = await NeighborRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    if (request.toHome.toString() !== home._id.toString()) {
      return res.status(403).json({ message: 'No autorizado para rechazar esta solicitud' });
    }

    request.status = 'rejected';
    await request.save();

    res.status(200).json({ message: 'Solicitud rechazada' });
  } catch (err) {
    res.status(500).json({ message: 'Error al rechazar solicitud', error: err.message });
  }
};

const getNeighbors = async (req, res) => {
  try {
    const { home } = await getCurrentUserHome(req.clerkUserId);

    const neighborLinks = await HomeNeighbor.find({
      $or: [
        { homeA: home._id },
        { homeB: home._id },
      ],
    })
      .populate('homeA', 'name code')
      .populate('homeB', 'name code')
      .sort({ createdAt: -1 });

    const neighbors = neighborLinks.map((link) => {
      const homeAId = link.homeA._id.toString();
      return homeAId === home._id.toString() ? link.homeB : link.homeA;
    });

    res.status(200).json({ neighbors });
  } catch (err) {
    res.status(500).json({ message: 'Error al cargar vecinos', error: err.message });
  }
};

module.exports = {
  searchHomeByCode,
  sendNeighborRequest,
  getNeighborRequests,
  acceptNeighborRequest,
  rejectNeighborRequest,
  getNeighbors,
};