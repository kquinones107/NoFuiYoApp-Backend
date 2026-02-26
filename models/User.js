const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    unique: true,
    index: true,
    sparse: true, // ✅ importante si vas a tener usuarios viejos sin clerkUserId
  },

  name: { type: String, default: '' },   // ya no required
  email: { type: String, unique: true, lowercase: true, sparse: true }, // ya no required
  password: { type: String, required: false }, // ✅ ya no required

  home: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Home',
    default: null
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);