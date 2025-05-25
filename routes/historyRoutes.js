const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { completeTask, getHomeHistory } = require('../controllers/historyController');

const upload = require('../middlewares/upload');

router.post(
  '/:taskId/complete',
  authMiddleware,
  upload.single('image'),
  completeTask
);

router.get('/', authMiddleware, getHomeHistory);

module.exports = router;
