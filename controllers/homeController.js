const crypto = require('crypto');
const Home = require('../models/Home');
const User = require('../models/User');
const { getOrCreateUserByClerkId } = require('../utils/getOrCreateUser');

function inviteCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const buf = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i += 1) out += chars[buf[i] % chars.length];
  return out;
}

function safeErrorPayload(err) {
  if (!err || typeof err !== 'object') return { message: String(err) };
  return {
    message: err.message,
    name: err.name,
    code: err.code,
  };
}

// Crear una casa
const createHome = async (req, res) => {
  const { name } = req.body;
  const clerkUserId = req.clerkUserId;

  console.log('[createHome] called — clerkUserId:', clerkUserId, '| name:', name);

  if (!clerkUserId) {
    console.error('[createHome] clerkUserId is missing on req');
    return res.status(400).json({ message: 'clerkUserId missing from request' });
  }

  try {
    console.log('[createHome] Step 1: getOrCreateUserByClerkId...');
    const user = await getOrCreateUserByClerkId(clerkUserId);
    console.log('[createHome] Step 1 OK — internal userId:', user._id.toString());

    let newHome;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = inviteCode(6);
      console.log(`[createHome] Step 2: attempt #${attempt + 1} — trying code: ${code}`);
      try {
        newHome = await Home.create({
          name,
          code,
          members: [user._id],
        });
        console.log('[createHome] Step 2 OK — home created:', newHome._id.toString());
        break;
      } catch (e) {
        if (e && e.code === 11000 && String(e.message || '').includes('code')) {
          console.warn('[createHome] Duplicate code, retrying...');
          continue;
        }
        console.error('[createHome] Step 2 FAILED — Home.create error:', e?.message, e?.code);
        throw e;
      }
    }
    if (!newHome) {
      console.error('[createHome] Could not generate unique invite code after 5 attempts');
      return res.status(500).json({ message: 'Error al crear hogar', error: 'No se pudo generar un código único' });
    }

    console.log('[createHome] Step 3: updating user with home reference...');
    await User.findByIdAndUpdate(user._id, {
      home: newHome._id,
      isAdmin: true,
    });
    console.log('[createHome] Step 3 OK — user updated');

    console.log('[createHome] ✅ Success — responding 201');
    res.status(201).json({ message: 'Hogar creado', home: newHome });
  } catch (err) {
    console.error('[createHome] ❌ Unexpected error:', err?.name, err?.message);
    console.error('[createHome] Full error:', err);
    res.status(500).json({ message: 'Error al crear hogar', error: safeErrorPayload(err) });
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
    console.error('joinHome:', err);
    res.status(500).json({ message: 'Error al unirse al hogar', error: safeErrorPayload(err) });
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
    res.status(500).json({ message: 'Error al obtener miembros del hogar', error: safeErrorPayload(error) });
  }
};

const getMyHomes = async (req, res) => {
  const clerkUserId = req.clerkUserId;

  try {
    const user = await getOrCreateUserByClerkId(clerkUserId);

    const homes = await Home.find({ members: user._id }).sort({ createdAt: -1 });

    res.status(200).json({ homes });
  } catch (err) {
    console.error('getMyHomes:', err);
    res.status(500).json({ message: 'Error al cargar hogares', error: safeErrorPayload(err) });
  }
};

module.exports = { createHome, joinHome, getHomeMembers, getMyHomes };