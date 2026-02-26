const express = require('express');
const router = express.Router();
const { getMonthlyStats } = require('../controllers/statsController');
const authMiddleware = require('../middlewares/authMiddleware');
const clerkAuth = require("../middlewares/clerkAuth");

router.get('/monthly', clerkAuth, getMonthlyStats);

module.exports = router;
