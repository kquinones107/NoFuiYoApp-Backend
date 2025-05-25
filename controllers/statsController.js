const History = require('../models/History');
const User = require('../models/User');
const mongoose = require('mongoose');

const getMonthlyStats = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user.home) return res.status(400).json({ message: 'No perteneces a un hogar' });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const history = await History.find({
      doneAt: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .populate({
        path: 'task',
        match: { }, // no necesitas filtro si no tienes campo 'home' en Task
      })
      .populate('doneBy', 'name home');

    const statsMap = {};

    for (const h of history) {
      // Validar si la tarea o el usuario no pertenecen al hogar
      if (!h.task || !h.doneBy || h.doneBy.home?.toString() !== user.home.toString()) {
        continue;
      }

      const userIdStr = h.doneBy._id.toString();

      if (!statsMap[userIdStr]) {
        statsMap[userIdStr] = {
          name: h.doneBy.name,
          completed: 0,
          late: 0,
        };
      }

      statsMap[userIdStr].completed++;

      const dueDate = new Date(h.task.dueDate);
      const doneDate = new Date(h.doneAt);
      if (doneDate > dueDate) {
        statsMap[userIdStr].late++;
      }
    }

    const result = Object.values(statsMap).map((entry) => ({
      name: entry.name,
      points: entry.completed - entry.late,
      completed: entry.completed,
      late: entry.late,
    })).sort((a, b) => b.points - a.points); // ordenamos por puntos descendente

    res.json({ stats: result });
  } catch (err) {
    console.error('Error al obtener estadísticas mensuales', err);
    res.status(500).json({ message: 'Error al obtener estadísticas', error: err });
  }
};

module.exports = { getMonthlyStats };
