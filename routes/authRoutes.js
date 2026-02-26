const express = require('express');
const router = express.Router();
const { register, login, updateProfile } = require('../controllers/authController');
const clerkAuth = require("../middlewares/clerkAuth");

router.put('/profile', clerkAuth, updateProfile);

module.exports = router;
