const mongoose = require('mongoose');

const gossipReplySchema = new mongoose.Schema({
  gossip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gossip',
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
    maxlength: 300,
  },
}, { timestamps: true });

gossipReplySchema.index({ gossip: 1, createdAt: 1 });

module.exports = mongoose.model('GossipReply', gossipReplySchema);