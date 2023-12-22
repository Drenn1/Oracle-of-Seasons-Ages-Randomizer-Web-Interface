const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BaseSchema = new Schema({
  date: {
    type: Date,
    default: Date.now()
  },

  version: {
    type: String,
    required: true,
  },

  game: {
    type: String,
    required: true
  },

  patchData: {
    type: Array,
    required: true
  }
});

module.exports = mongoose.model('bases', BaseSchema);