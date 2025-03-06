const mongoose = require('mongoose')

const trandauSchema = new mongoose.Schema({
  id: { type: Number },
  gameId: { type: Number, default: null },
  started: { type: Number, default: null },
  leagueName: { type: String, default: null },
  homeTeam: { type: String, default: null },
  awayTeam: { type: String, default: null },
  tradeVolume: { type: Number, default: null },
  homeIcon: { type: String, default: null },
  awayIcon: { type: String, default: null },
  is_home: { type: Number, default: 0 },
  is_hot: { type: Number, default: 0 },
  resultH: { type: Number, default: null },
  resultC: { type: Number, default: null },
  resultUpH: { type: Number, default: null },
  resultUpC: { type: Number, default: null },
  resultUpdate: { type: Number, default: 0 },
  message: { type: String, default: null },
  created: { type: Number, default: null },
  updated: { type: Number, default: null },
  status: { type: Number, default: 1 }
})

const TranDau = mongoose.model('trandau', trandauSchema)
module.exports = TranDau
