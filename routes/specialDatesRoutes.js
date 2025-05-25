const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getDates, createDate } = require('../controllers/specialDatesController');

router.get('/', authMiddleware, getDates);
router.post('/', authMiddleware, createDate);

module.exports = router;
