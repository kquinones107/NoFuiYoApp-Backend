const User = require("../models/User");

async function getOrCreateUserByClerkId(clerkUserId) {
  let user = await User.findOne({ clerkUserId });
  if (!user) {
    user = await User.create({ clerkUserId });
  }
  return user;
}

module.exports = { getOrCreateUserByClerkId };