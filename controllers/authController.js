const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ message: 'El usuario ya existe' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el registro', error });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        home: user.home,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el login', error });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;

  try {
    const updated = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: 'Perfil actualizado', user: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar perfil', error });
  }
};

module.exports = { register, login, updateProfile };
