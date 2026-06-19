const express = require('express');
const router = express.Router();
const requireClerkAuth = require('../middlewares/requireClerkAuth');

const {
  createGossip,
  getGossipFeed,
  getGossipById,
  replyToGossip,
  reactToGossip,
} = require('../controllers/gossipController');

router.post('/', requireClerkAuth, createGossip);
router.get('/', requireClerkAuth, getGossipFeed);
router.get('/:id', requireClerkAuth, getGossipById);
router.post('/:id/reply', requireClerkAuth, replyToGossip);
router.post('/:id/reaction', requireClerkAuth, reactToGossip);
module.exports = router;