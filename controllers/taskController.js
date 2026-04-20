const Task = require('../models/Task');
const User = require('../models/User');
const History = require('../models/History');
const { getOrCreateUserByClerkId } = require('../utils/getOrCreateUser');

// Crear nueva tarea
const createTask = async (req, res) => {
  const { name, assignedTo, frequency, dueDate, customIntervalDays } = req.body;
  const clerkUserId = req.clerkUserId;

  if (!name || !assignedTo || !dueDate) {
    return res.status(400).json({ message: 'Faltan campos requeridos' });
  }

  try {
    // 1) Usuario interno por Clerk
    const user = await getOrCreateUserByClerkId(clerkUserId);

    if (!user.home) return res.status(400).json({ message: 'Debes pertenecer a un hogar' });

    const allowedFreq = ['daily', 'weekly', 'monthly', 'custom'];
    const freq = allowedFreq.includes(frequency) ? frequency : 'daily';

    let intervalDays = null;
    if (freq === 'custom') {
      const n = Number(customIntervalDays);
      if (!Number.isFinite(n) || n < 1 || n > 365) {
        return res.status(400).json({
          message: 'Para frecuencia personalizada indica customIntervalDays entre 1 y 365',
        });
      }
      intervalDays = Math.round(n);
    }

    const task = await Task.create({
      name,
      home: user.home,
      assignedTo,          // esto sigue siendo un User._id (Mongo)
      frequency: freq,
      ...(freq === 'custom' ? { customIntervalDays: intervalDays } : {}),
      dueDate,
      createdBy: user._id, // 👈 antes req.user.id, ahora user._id
    });

    res.status(201).json({ message: 'Tarea creada correctamente', task });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear tarea', error: err });
  }
};

// Obtener tareas del hogar
const getTasks = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId;

    // 1️⃣ Obtener usuario interno desde Clerk
    const user = await getOrCreateUserByClerkId(clerkUserId);

    if (!user.home) {
      return res.status(400).json({ message: 'Debes pertenecer a un hogar' });
    }

    // 2️⃣ Buscar todas las tareas del hogar
    const tasksInHome = await Task.find({ home: user.home }).select('_id');
    const taskIds = tasksInHome.map(t => t._id);

    // 3️⃣ Buscar historial SOLO de esas tareas
    const completedHistories = await History.find({
      task: { $in: taskIds }
    }).select('task');

    const completedTaskIds = completedHistories.map(h =>
      h.task.toString()
    );

    // 4️⃣ Traer tareas del hogar que NO estén completadas
    const tasks = await Task.find({
      home: user.home,
      _id: { $nin: completedTaskIds }
    }).populate('assignedTo', 'name email');

    res.status(200).json({ tasks });

  } catch (err) {
    res.status(500).json({ message: 'Error al cargar tareas', error: err });
  }
};

module.exports = { createTask, getTasks };