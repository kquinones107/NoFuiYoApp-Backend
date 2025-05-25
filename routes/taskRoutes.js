const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { createTask, getTasks } = require('../controllers/taskController');

router.post('/', authMiddleware, createTask);
router.get('/', authMiddleware, getTasks);

module.exports = router;
