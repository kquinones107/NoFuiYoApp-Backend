const express = require('express');
const router = express.Router();
const { updateProfile } = require('../controllers/authController');
const requireClerkAuth = require("../middlewares/requirerequireClerkAuth");

router.put('/profile', requireClerkAuth, updateProfile);


module.exports = router;
