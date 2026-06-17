const express = require('express');
const router = express.Router();
const requireClerkAuth = require('../middlewares/requireClerkAuth');

const {
  createGossip,
  getGossipFeed,
  getGossipById,
  replyToGossip,
} = require('../controllers/gossipController');

router.post('/', requireClerkAuth, createGossip);
router.get('/', requireClerkAuth, getGossipFeed);
router.get('/:id', requireClerkAuth, getGossipById);
router.post('/:id/reply', requireClerkAuth, replyToGossip);

module.exports = router;