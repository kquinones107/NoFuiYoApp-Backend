const express = require('express');
const router = express.Router();
const { getMonthlyStats } = require('../controllers/statsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/monthly', authMiddleware, getMonthlyStats);

module.exports = router;
