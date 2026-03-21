const express = require('express');
const router = express.Router();
const { completeTask, getHomeHistory } = require('../controllers/historyController');
const requireClerkAuth = require("../middlewares/requireClerkAuth");

const upload = require('../middlewares/upload');

router.post(
  '/:taskId/complete',
  requireClerkAuth,
  upload.single('image'),
  completeTask
);

router.get('/', requireClerkAuth, getHomeHistory);

module.exports = router;
