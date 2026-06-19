const mongoose = require('mongoose');

const gossipReactionSchema = new mongoose.Schema({
  gossip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gossip',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reaction: {
    type: String,
    enum: ['😂', '👀', '🔥', '😱', '🤯'],
    required: true,
  },
}, { timestamps: true });

gossipReactionSchema.index({ gossip: 1, user: 1, reaction: 1 }, { unique: true });
gossipReactionSchema.index({ gossip: 1 });

module.exports = mongoose.model('GossipReaction', gossipReactionSchema);