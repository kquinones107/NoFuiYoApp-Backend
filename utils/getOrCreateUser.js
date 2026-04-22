const User = require("../models/User");
const { clerkClient } = require("@clerk/clerk-sdk-node");

async function getOrCreateUserByClerkId(clerkUserId) {
  if (!clerkUserId) {
    throw new Error("clerkUserId es requerido");
  }

  // Buscar usuario existente en Mongo
  let user = await User.findOne({ clerkUserId });

  // Traer datos reales desde Clerk
  const clerkUser = await clerkClient.users.getUser(clerkUserId);

  const email =
    clerkUser.emailAddresses?.[0]?.emailAddress || "";

  const fullName =
    `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();

  const safeName =
    fullName ||
    clerkUser.username ||
    (email ? email.split("@")[0] : "") ||
    "Usuario";

  if (user) {
    let changed = false;

    if (!user.name || !user.name.trim()) {
      user.name = safeName;
      changed = true;
    }

    if ((!user.email || !user.email.trim()) && email) {
      user.email = email;
      changed = true;
    }

    if (changed) {
      await user.save();
    }

    return user;
  }

  // Crear usuario nuevo si no existe
  user = await User.create({
    clerkUserId,
    name: safeName,
    email,
  });

  return user;
}

module.exports = { getOrCreateUserByClerkId };