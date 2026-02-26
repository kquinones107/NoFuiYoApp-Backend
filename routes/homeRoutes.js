const express = require('express');
const router = express.Router();

const { createHome, joinHome, getHomeMembers, getMyHomes } = require('../controllers/homeController');
const clerkAuth = require("../middlewares/clerkAuth");

router.post('/create', clerkAuth, createHome);
router.post('/join/:code', clerkAuth, joinHome);
router.get('/members', clerkAuth, getHomeMembers);
router.get('/mis-hogares', clerkAuth, getMyHomes);



module.exports = router;
