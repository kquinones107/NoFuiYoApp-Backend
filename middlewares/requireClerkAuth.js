// middlewares/requireClerkAuth.js
const { getAuth } = require('@clerk/express');

function requireClerkAuth(req, res, next) {
  let auth;
  try {
    auth = getAuth(req);
  } catch (e) {
    console.error('[requireClerkAuth] getAuth() threw:', e?.message);
    return res.status(500).json({ message: 'Auth middleware error', error: e?.message });
  }

  console.log('[requireClerkAuth] auth.userId:', auth?.userId ?? 'null');
  console.log('[requireClerkAuth] auth.sessionId:', auth?.sessionId ?? 'null');
  console.log('[requireClerkAuth] Authorization header present:', !!req.headers?.authorization);

  // auth.isAuthenticated does not exist in @clerk/express v2 — check userId only
  if (!auth?.userId) {
    console.warn('[requireClerkAuth] No userId → returning 401');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.clerkUserId = auth.userId;
  console.log('[requireClerkAuth] ✅ Authenticated clerkUserId:', auth.userId);
  next();
}

module.exports = requireClerkAuth;