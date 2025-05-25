const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  home: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Home',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'custom'],
    default: 'daily'
  },
  nextDate: {
    type: Date,
    default: Date.now
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  dueDate: { 
    type: Date, 
    required: true 
  },

}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
