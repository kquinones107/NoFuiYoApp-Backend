const express = require('express');
const router = express.Router();
const { getMonthlyStats } = require('../controllers/statsController');
const requireClerkAuth = require("../middlewares/requireClerkAuth");

router.get('/monthly', requireClerkAuth, getMonthlyStats);

module.exports = router;
