// middlewares/requirerequireClerkAuth.js
const { getAuth } = require('@clerk/express');

function requireClerkAuth(req, res, next) {
  const auth = getAuth(req);

  if (!auth.isAuthenticated || !auth.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.clerkUserId = auth.userId;
  next();
}

module.exports = requireClerkAuth;