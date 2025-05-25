const mongoose = require('mongoose');

const specialDateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  home: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Home',
    required: true,
  },
});

module.exports = mongoose.model('SpecialDate', specialDateSchema);