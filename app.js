const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const homeRoutes = require('./routes/homeRoutes');
app.use('/api/home', homeRoutes);

const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

const historyRoutes = require('./routes/historyRoutes');
app.use('/api/history', historyRoutes);

const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);

const statsRoutes = require('./routes/statsRoutes');
app.use('/api/stats', statsRoutes);

const specialDatesRoutes = require('./routes/specialDatesRoutes');
app.use('/api/dates', specialDatesRoutes);

// Ruta de prueba protegida
const authMiddleware = require('./middlewares/authMiddleware');
app.get('/api/protected', authMiddleware, (req, res) => {
  res.send(`Hola ${req.user.email}, estás autenticado ✅`);
});


app.get('/', (req, res) => {
  res.send('Casa en Orden API está activa 🚀');
});

module.exports = app;

