const express = require('express');
const router = express.Router();
const { completeTask, getHomeHistory } = require('../controllers/historyController');
const clerkAuth = require("../middlewares/clerkAuth");

const upload = require('../middlewares/upload');

router.post(
  '/:taskId/complete',
  clerkAuth,
  upload.single('image'),
  completeTask
);

router.get('/', clerkAuth, getHomeHistory);

module.exports = router;
