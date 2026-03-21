const express = require('express');
const router = express.Router();

const { createHome, joinHome, getHomeMembers, getMyHomes } = require('../controllers/homeController');
const requireClerkAuth = require("../middlewares/requireClerkAuth");

router.post('/create', requireClerkAuth, createHome);
router.post('/join/:code', requireClerkAuth, joinHome);
router.get('/members', requireClerkAuth, getHomeMembers);
router.get('/mis-hogares', requireClerkAuth, getMyHomes);



module.exports = router;
