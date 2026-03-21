const express = require('express');
const router = express.Router();
const { createTask, getTasks } = require('../controllers/taskController');
const requireClerkAuth = require("../middlewares/requireClerkAuth");

router.post('/', requireClerkAuth, createTask);
router.get('/', requireClerkAuth, getTasks);

module.exports = router;
