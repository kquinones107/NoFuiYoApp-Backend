const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  doneBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doneAt: {
    type: Date,
    default: Date.now
  },
  photoUrl: {
    type: String,
    default: null
  },
  late: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });

module.exports = mongoose.model('History', historySchema);
