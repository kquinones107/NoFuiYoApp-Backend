const mongoose = require('mongoose');

const neighborRequestSchema = new mongoose.Schema({
  fromHome: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Home',
    required: true,
  },
  toHome: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Home',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

neighborRequestSchema.index({ fromHome: 1, toHome: 1 }, { unique: true });

module.exports = mongoose.model('NeighborRequest', neighborRequestSchema);