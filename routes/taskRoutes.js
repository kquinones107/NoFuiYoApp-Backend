const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { createTask, getTasks } = require('../controllers/taskController');
const clerkAuth = require("../middlewares/clerkAuth");

router.post('/', clerkAuth, createTask);
router.get('/', clerkAuth, getTasks);

module.exports = router;
