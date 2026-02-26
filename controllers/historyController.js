const History = require('../models/History');
const Task = require('../models/Task');
const cloudinary = require('../config/cloudinary');
const User = require('../models/User');
const { getOrCreateUserByClerkId } = require('../utils/getOrCreateUser');

// Marcar una tarea como completada
const completeTask = async (req, res) => {
  const { taskId } = req.params;
  const clerkUserId = req.clerkUserId;

  console.log('📥 photoUrl recibido del frontend:', req.body.photoUrl);
  console.log('📷 Archivo recibido:', req.file);

  try {
    // 1) Mapear Clerk -> User interno
    const user = await getOrCreateUserByClerkId(clerkUserId);

    // 2) Resolver photoUrl
    let photoUrl = req.body.photoUrl || null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'casa-en-orden'
      });
      photoUrl = result.secure_url;
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });

    const now = new Date();
    const late = task.dueDate && now > task.dueDate;

    console.log('✅ Preparando historial con photoUrl:', photoUrl);

    const history = await History.create({
      task: taskId,
      doneBy: user._id,  // 👈 antes userId = req.user.id
      photoUrl,
      late,
    });

    console.log('✅ Historial creado:', history);

    res.status(201).json({
      message: 'Tarea registrada en historial',
      history
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al completar tarea', error });
  }
};

// Ver historial del hogar del usuario
const getHomeHistory = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;
    const user = await getOrCreateUserByClerkId(clerkUserId);

    const userWithHome = await User.findById(user._id);
    if (!userWithHome.home) {
      return res.status(400).json({ message: 'No perteneces a un hogar' });
    }

    const history = await History.find()
      .populate({
        path: 'task',
        match: { home: userWithHome.home },
        populate: {
          path: 'assignedTo',
          select: 'name'
        }
      })
      .populate('doneBy', 'name')
      .sort({ doneAt: -1 });

    const filteredHistory = history.filter(h => h.task !== null);

    res.status(200).json({ history: filteredHistory });
  } catch (err) {
    console.error('❌ Error al consultar historial:', err);
    res.status(500).json({ message: 'Error al consultar historial', error: err });
  }
};

module.exports = { completeTask, getHomeHistory };