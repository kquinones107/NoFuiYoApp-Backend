const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { createHome, joinHome, getHomeMembers, getMyHomes } = require('../controllers/homeController');

router.post('/create', authMiddleware, createHome);
router.post('/join/:code', authMiddleware, joinHome);
router.get('/members', authMiddleware, getHomeMembers);
router.get('/mis-hogares', authMiddleware, getMyHomes);

module.exports = router;
