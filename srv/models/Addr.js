const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AddrSchema = new Schema({
  date: {
    type: Date,
    default: Date.now()
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

module.exports = mongoose.model('addrs', AddrSchema);