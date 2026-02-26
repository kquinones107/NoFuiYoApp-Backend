const { clerkClient } = require("@clerk/clerk-sdk-node");

async function clerkAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verifica el token y obtiene el userId
    const payload = await clerkClient.verifyToken(token);
    // payload.sub = userId de Clerk (ej: user_...)
    req.clerkUserId = payload.sub;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Clerk token" });
  }
}

module.exports = clerkAuth;