const express = require('express');
const router = express.Router();

const { createHome, joinHome, getHomeMembers, getMyHomes, updateHome, deleteHome } = require('../controllers/homeController');
const requireClerkAuth = require("../middlewares/requireClerkAuth");

router.post('/create', requireClerkAuth, createHome);
router.post('/join/:code', requireClerkAuth, joinHome);
router.get('/members', requireClerkAuth, getHomeMembers);
router.get('/mis-hogares', requireClerkAuth, getMyHomes);
router.put('/:id', requireClerkAuth, updateHome);
router.delete('/:id', requireClerkAuth, deleteHome);



module.exports = router;
