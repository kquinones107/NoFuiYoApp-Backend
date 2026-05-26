const User = require('../models/User');
const { getOrCreateUserByClerkId } = require('../utils/getOrCreateUser');
const { clerkClient } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');
const Home = require('../models/Home');
const Task = require('../models/Task');
const History = require('../models/History');

const updateProfile = async (req, res) => {
  const clerkUserId = req.clerkUserId;
  const { name, email } = req.body;

  try {
    const internalUser = await getOrCreateUserByClerkId(clerkUserId);

    const updated = await User.findByIdAndUpdate(
      internalUser._id,
      { name, email },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: 'Perfil actualizado', user: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar perfil', error });
  }
};

const deleteAccount = async (req, res) => {
  const clerkUserId = req.clerkUserId;

  try {
    const user = await User.findOne({ clerkUserId });

    if (!user) {
      await clerkClient.users.deleteUser(clerkUserId);
      return res.status(200).json({ message: 'Cuenta eliminada correctamente' });
    }

    // 1. Quitar al usuario de todos los hogares donde sea miembro
    await Home.updateMany(
      { members: user._id },
      { $pull: { members: user._id } }
    );

    // 2. Eliminar hogares que quedaron sin miembros
    await Home.deleteMany({ members: { $size: 0 } });

    // 3. Eliminar tareas creadas/asignadas al usuario
    await Task.deleteMany({
      $or: [
        { assignedTo: user._id },
        { createdBy: user._id },
      ],
    });

    // 4. Eliminar historial hecho por el usuario
    await History.deleteMany({ doneBy: user._id });

    // 5. Eliminar usuario local de Mongo
    await User.findByIdAndDelete(user._id);

    // 6. Eliminar usuario de Clerk
    await clerkClient.users.deleteUser(clerkUserId);

    res.status(200).json({ message: 'Cuenta eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar cuenta:', err);
    res.status(500).json({
      message: 'Error al eliminar cuenta',
      error: err.message,
    });
  }
};

module.exports = { updateProfile, deleteAccount };