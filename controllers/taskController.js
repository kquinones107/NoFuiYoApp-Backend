const Task = require('../models/Task');
const User = require('../models/User');

// Crear nueva tarea
const createTask = async (req, res) => {
  const { name, assignedTo, frequency, dueDate } = req.body;
  const userId = req.user.id;

  if (!name || !assignedTo || !dueDate) {
    return res.status(400).json({ message: 'Faltan campos requeridos' });
  }

  try {
    const user = await User.findById(userId);
    if (!user.home) return res.status(400).json({ message: 'Debes pertenecer a un hogar' });

    const task = await Task.create({
      name,
      home: user.home,
      assignedTo,
      frequency,
      dueDate,
      createdBy: req.user.id,
    });

    res.status(201).json({ message: 'Tarea creada correctamente', task });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear tarea', error: err });
  }
};

// Obtener tareas del hogar
const getTasks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.home) {
      return res.status(400).json({ message: 'Debes pertenecer a un hogar' });
    }

    // Obtener IDs de tareas ya hechas desde el historial
    const completedHistories = await History.find().select('task');
    const completedTaskIds = completedHistories.map(h => h.task.toString());

    // Traer solo tareas del hogar que no están en el historial
    const tasks = await Task.find({
      home: user.home,
      _id: { $nin: completedTaskIds },
    }).populate('assignedTo', 'name email');

    res.status(200).json({ tasks });
  } catch (err) {
    res.status(500).json({ message: 'Error al cargar tareas', error: err });
  }
};

module.exports = { createTask, getTasks };
