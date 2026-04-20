const User = require("../models/User");

async function getOrCreateUserByClerkId(clerkUserId) {
  // Atomic upsert: avoids race conditions and never touches the email field,
  // which prevents the E11000 duplicate-null error on the email index.
  const user = await User.findOneAndUpdate(
    { clerkUserId },
    { $setOnInsert: { clerkUserId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return user;
}

module.exports = { getOrCreateUserByClerkId };