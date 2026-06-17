const mongoose = require('mongoose');

const homeNeighborSchema = new mongoose.Schema({
  homeA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Home',
    required: true,
  },
  homeB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Home',
    required: true,
  },
}, { timestamps: true });

homeNeighborSchema.index({ homeA: 1, homeB: 1 }, { unique: true });

module.exports = mongoose.model('HomeNeighbor', homeNeighborSchema);