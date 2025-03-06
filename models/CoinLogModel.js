const mongoose = require('mongoose')

const coinlogSchema = new mongoose.Schema({
  id: { type: Number },
  user_id: { type: Number },
  amount: { type: Number },
  reason: { type: String },
  previous: { type: Number },
  created: { type: Number, default: 0 },
  updated: { type: Number, default: 0 },
  status: { type: Number, default: 0 },
  check: { type: String }
})

const coinlog = mongoose.model('coinlog', coinlogSchema)
module.exports = coinlog
