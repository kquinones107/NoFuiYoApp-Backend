const Gossip = require('../models/Gossip');
const GossipReply = require('../models/GossipReply');
const HomeNeighbor = require('../models/HomeNeighbor');
const User = require('../models/User');
const { getOrCreateUserByClerkId } = require('../utils/getOrCreateUser');
const GossipReaction = require('../models/GossipReaction');

function safeErrorPayload(err) {
  if (!err || typeof err !== 'object') return { message: String(err) };
  return {
    message: err.message,
    name: err.name,
    code: err.code,
  };
}

const getCurrentUserHome = async (clerkUserId) => {
  const user = await getOrCreateUserByClerkId(clerkUserId);
  const userWithHome = await User.findById(user._id);

  if (!userWithHome || !userWithHome.home) {
    const error = new Error('Debes pertenecer a un hogar para usar Chismecito NoFuiYo');
    error.statusCode = 400;
    throw error;
  }

  return {
    user,
    homeId: userWithHome.home,
  };
};

const getNeighborHomeIds = async (homeId) => {
  const links = await HomeNeighbor.find({
    $or: [
      { homeA: homeId },
      { homeB: homeId },
    ],
  });

  const currentHomeId = homeId.toString();

  return links.map((link) => {
    const homeA = link.homeA.toString();
    const homeB = link.homeB.toString();

    return homeA === currentHomeId ? link.homeB : link.homeA;
  });
};

const createGossip = async (req, res) => {
  const { content, durationHours } = req.body;
  const clerkUserId = req.clerkUserId;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'El chismecito no puede estar vacío' });
  }

  if (content.trim().length > 500) {
    return res.status(400).json({ message: 'El chismecito no puede superar 500 caracteres' });
  }

  try {
    const { user, homeId } = await getCurrentUserHome(clerkUserId);

    const hours = Number(durationHours) === 36 ? 36 : 24;
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    const gossip = await Gossip.create({
      home: homeId,
      authorUser: user._id,
      content: content.trim(),
      expiresAt,
      status: 'active',
    });

    res.status(201).json({
      message: 'Chismecito publicado. Recuerda: NoFuiYo quien lo dijo.',
      gossip: {
        _id: gossip._id,
        content: gossip.content,
        expiresAt: gossip.expiresAt,
        createdAt: gossip.createdAt,
        replyCount: 0,
      },
    });
  } catch (err) {
    console.error('createGossip:', err);
    res.status(err.statusCode || 500).json({
      message: err.message || 'Error al crear chismecito',
      error: safeErrorPayload(err),
    });
  }
};

const getGossipFeed = async (req, res) => {
  const clerkUserId = req.clerkUserId;

  try {
    const { homeId } = await getCurrentUserHome(clerkUserId);
    const neighborHomeIds = await getNeighborHomeIds(homeId);

    const visibleHomeIds = [homeId, ...neighborHomeIds];
    const now = new Date();

    const gossips = await Gossip.find({
      home: { $in: visibleHomeIds },
      status: 'active',
      expiresAt: { $gt: now },
    })
      .select('content expiresAt createdAt home')
      .sort({ createdAt: -1 })
      .lean();

    const gossipIds = gossips.map((g) => g._id);

    const replyCounts = await GossipReply.aggregate([
      { $match: { gossip: { $in: gossipIds } } },
      { $group: { _id: '$gossip', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    replyCounts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const reactionCounts = await GossipReaction.aggregate([
      { $match: { gossip: { $in: gossipIds } } },
      {
        $group: {
          _id: {
            gossip: '$gossip',
            reaction: '$reaction',
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const defaultReactions = {
      '😂': 0,
      '👀': 0,
      '🔥': 0,
      '😱': 0,
      '🤯': 0,
    };

    const reactionMap = {};

    reactionCounts.forEach((item) => {
      const gossipId = item._id.gossip.toString();
      const reaction = item._id.reaction;

      if (!reactionMap[gossipId]) {
        reactionMap[gossipId] = { ...defaultReactions };
      }

      reactionMap[gossipId][reaction] = item.count;
    });

    const feed = gossips.map((gossip) => {
      const gossipId = gossip._id.toString();

      return {
        _id: gossip._id,
        content: gossip.content,
        createdAt: gossip.createdAt,
        expiresAt: gossip.expiresAt,
        replyCount: countMap[gossipId] || 0,
        reactions: reactionMap[gossipId] || { ...defaultReactions },
      };
    });

    res.status(200).json({ gossips: feed });
  } catch (err) {
    console.error('getGossipFeed:', err);
    res.status(err.statusCode || 500).json({
      message: err.message || 'Error al cargar chismecitos',
      error: safeErrorPayload(err),
    });
  }
};

const getGossipById = async (req, res) => {
  const { id } = req.params;
  const clerkUserId = req.clerkUserId;

  try {
    const { homeId } = await getCurrentUserHome(clerkUserId);
    const neighborHomeIds = await getNeighborHomeIds(homeId);

    const visibleHomeIds = [homeId, ...neighborHomeIds];
    const now = new Date();

    const gossip = await Gossip.findOne({
      _id: id,
      home: { $in: visibleHomeIds },
      status: 'active',
      expiresAt: { $gt: now },
    })
      .select('content expiresAt createdAt')
      .lean();

    if (!gossip) {
      return res.status(404).json({ message: 'Chismecito no encontrado o expirado' });
    }

    const replies = await GossipReply.find({ gossip: id })
      .select('content createdAt')
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      gossip: {
        _id: gossip._id,
        content: gossip.content,
        createdAt: gossip.createdAt,
        expiresAt: gossip.expiresAt,
      },
      replies,
    });
  } catch (err) {
    console.error('getGossipById:', err);
    res.status(err.statusCode || 500).json({
      message: err.message || 'Error al cargar detalle del chismecito',
      error: safeErrorPayload(err),
    });
  }
};

const replyToGossip = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const clerkUserId = req.clerkUserId;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'La respuesta no puede estar vacía' });
  }

  if (content.trim().length > 300) {
    return res.status(400).json({ message: 'La respuesta no puede superar 300 caracteres' });
  }

  try {
    const { user, homeId } = await getCurrentUserHome(clerkUserId);
    const neighborHomeIds = await getNeighborHomeIds(homeId);

    const visibleHomeIds = [homeId, ...neighborHomeIds];
    const now = new Date();

    const gossip = await Gossip.findOne({
      _id: id,
      home: { $in: visibleHomeIds },
      status: 'active',
      expiresAt: { $gt: now },
    });

    if (!gossip) {
      return res.status(404).json({ message: 'No puedes responder este chismecito o ya expiró' });
    }

    const reply = await GossipReply.create({
      gossip: gossip._id,
      authorUser: user._id,
      content: content.trim(),
    });

    res.status(201).json({
      message: 'Respuesta publicada de forma anónima',
      reply: {
        _id: reply._id,
        content: reply.content,
        createdAt: reply.createdAt,
      },
    });
  } catch (err) {
    console.error('replyToGossip:', err);
    res.status(err.statusCode || 500).json({
      message: err.message || 'Error al responder chismecito',
      error: safeErrorPayload(err),
    });
  }
};

const reactToGossip = async (req, res) => {
  const { id } = req.params;
  const { reaction } = req.body;
  const clerkUserId = req.clerkUserId;

  const allowedReactions = ['😂', '👀', '🔥', '😱', '🤯'];

  if (!allowedReactions.includes(reaction)) {
    return res.status(400).json({ message: 'Reacción no válida' });
  }

  try {
    const { user, homeId } = await getCurrentUserHome(clerkUserId);
    const neighborHomeIds = await getNeighborHomeIds(homeId);

    const visibleHomeIds = [homeId, ...neighborHomeIds];
    const now = new Date();

    const gossip = await Gossip.findOne({
      _id: id,
      home: { $in: visibleHomeIds },
      status: 'active',
      expiresAt: { $gt: now },
    });

    if (!gossip) {
      return res.status(404).json({ message: 'Chismecito no encontrado o expirado' });
    }

    const existing = await GossipReaction.findOne({
      gossip: gossip._id,
      user: user._id,
      reaction,
    });

    if (existing) {
      await GossipReaction.findByIdAndDelete(existing._id);
    } else {
      await GossipReaction.create({
        gossip: gossip._id,
        user: user._id,
        reaction,
      });
    }

    const reactionCounts = await GossipReaction.aggregate([
      { $match: { gossip: gossip._id } },
      { $group: { _id: '$reaction', count: { $sum: 1 } } },
    ]);

    const reactions = {};
    allowedReactions.forEach((r) => {
      reactions[r] = 0;
    });

    reactionCounts.forEach((item) => {
      reactions[item._id] = item.count;
    });

    res.status(200).json({
      message: existing ? 'Reacción quitada' : 'Reacción agregada',
      reactions,
    });
  } catch (err) {
    console.error('reactToGossip:', err);
    res.status(err.statusCode || 500).json({
      message: err.message || 'Error al reaccionar al chismecito',
      error: safeErrorPayload(err),
    });
  }
};

module.exports = {
  createGossip,
  getGossipFeed,
  getGossipById,
  replyToGossip,
  reactToGossip,
};