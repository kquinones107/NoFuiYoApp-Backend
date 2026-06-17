const mongoose = require('mongoose');

const gossipSchema = new mongoose.Schema({
  home: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Home',
    required: true,
  },
  authorUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 500,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'reported', 'removed'],
    default: 'active',
  },
}, { timestamps: true });

gossipSchema.index({ expiresAt: 1 });
gossipSchema.index({ home: 1, createdAt: -1 });

module.exports = mongoose.model('Gossip', gossipSchema);