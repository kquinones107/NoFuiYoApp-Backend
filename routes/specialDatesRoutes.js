const express = require('express');
const router = express.Router();
const { getDates, createDate } = require('../controllers/specialDatesController');
const requireClerkAuth = require("../middlewares/requireClerkAuth");

router.get('/', requireClerkAuth, getDates);
router.post('/', requireClerkAuth, createDate);

module.exports = router;
