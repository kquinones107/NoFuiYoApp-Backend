const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getDates, createDate } = require('../controllers/specialDatesController');
const clerkAuth = require("../middlewares/clerkAuth");

router.get('/', clerkAuth, getDates);
router.post('/', clerkAuth, createDate);

module.exports = router;
