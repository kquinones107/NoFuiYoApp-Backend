const express = require('express');
const router = express.Router();
const { updateProfile } = require('../controllers/authController');
const requireClerkAuth = require("../middlewares/requireClerkAuth");

router.put('/profile', requireClerkAuth, updateProfile);


module.exports = router;
