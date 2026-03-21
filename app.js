const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { clerkMiddleware } = require('@clerk/express');

dotenv.config();

// ── Startup environment check ─────────────────────────────────────────────────
const REQUIRED_ENV = ['CLERK_SECRET_KEY', 'MONGO_URI'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('❌ Missing required environment variables:', missing.join(', '));
  console.error('   Add them to your .env file or Render dashboard and restart.');
}
// ─────────────────────────────────────────────────────────────────────────────

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

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
const requireClerkAuth = require('./middlewares/requireClerkAuth');

app.get('/api/protected', requireClerkAuth, (req, res) => {
  res.json({
    message: 'Autenticado con Clerk ✅',
    clerkUserId: req.clerkUserId,
  });
});

router.get('/me', requireClerkAuth, async (req, res) => {
  res.json({
    ok: true,
    clerkUserId: req.clerkUserId,
  });
});

app.get('/', (req, res) => {
  res.send('Casa en Orden API está activa 🚀');
});

module.exports = app;

