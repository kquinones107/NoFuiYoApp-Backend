const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const User = require('../models/User');
const { getOrCreateUserByClerkId } = require('../utils/getOrCreateUser');

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

module.exports = { updateProfile };
