const { clerkClient } = require("@clerk/clerk-sdk-node");

if (!process.env.CLERK_SECRET_KEY) {
  console.error(
    "❌ [clerkAuth] CLERK_SECRET_KEY is not set. " +
      "All protected routes will return 401. " +
      "Add it to your .env file or Render environment variables."
  );
}

async function clerkAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const payload = await clerkClient.verifyToken(token);
    req.clerkUserId = payload.sub;
    next();
  } catch (err) {
    console.error("[clerkAuth] Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid Clerk token", detail: err.message });
  }
}

module.exports = clerkAuth;