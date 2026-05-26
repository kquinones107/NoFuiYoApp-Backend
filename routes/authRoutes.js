const express = require('express');
const router = express.Router();
const { updateProfile, deleteAccount } = require('../controllers/authController');
const requireClerkAuth = require("../middlewares/requireClerkAuth");

router.get('/me', requireClerkAuth, async (req, res) => {
  res.json({
    ok: true,
    clerkUserId: req.clerkUserId,
  });
});

router.put('/profile', requireClerkAuth, updateProfile);
router.delete('/delete-account', requireClerkAuth, deleteAccount);

module.exports = router;
