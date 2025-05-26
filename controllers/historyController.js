const History = require('../models/History');
const Task = require('../models/Task');
const cloudinary = require('../config/cloudinary');

// Marcar una tarea como completada
const completeTask = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;
  const { photoUrl } = req.body;
  console.log('📥 photoUrl recibido del frontend:', req.body.photoUrl);

  try {
    let photoUrl = null;

     if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'casa-en-orden'
      });
      photoUrl = result.secure_url;
    }

    const task = await Task.findById(taskId);
    const now = new Date();
    const late = task.dueDate && now > task.dueDate;

    const history = await History.create({
      task: taskId,
      doneBy: userId,
      photoUrl: photoUrl || null,
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
    const user = await User.findById(req.user.id);
    if (!user.home) {
      return res.status(400).json({ message: 'No perteneces a un hogar' });
    }

    // Traer solo historial de tareas cuyo hogar coincida
    const history = await History.find()
      .populate({
        path: 'task',
       // match: { home: user.home }, // 🔥 Aquí está el filtro importante
        populate: {
          path: 'assignedTo',
          select: 'name'
        }
      })
      .populate('doneBy', 'name')
      .sort({ doneAt: -1 });

    // Elimina entradas donde la tarea fue null (porque no coincide con el hogar)
    const filteredHistory = history.filter(h => h.task !== null);

    res.status(200).json({ history: filteredHistory });
  } catch (err) {
    console.error('❌ Error al consultar historial:', err);
    res.status(500).json({ message: 'Error al consultar historial', error: err });
  }
};

module.exports = { completeTask, getHomeHistory };
