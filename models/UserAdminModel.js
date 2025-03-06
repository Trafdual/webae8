const mongoose = require('mongoose')

const useradminSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String },
  username: { type: String },
  role: { type: String },
  password: { type: String },
  email: { type: String },
  birthday: { type: String },
  gender: { type: String },
  address: { type: String },
  phone: { type: String },
  avatar: { type: String },
  reset_token: { type: String },
  reset_expiration: { type: Number },
  created: { type: Number, default: 0 },
  updated: { type: Number, default: 0 },
  status: { type: Number, default: 0 },
  last_login: { type: Number, default: 0 },
  last_ip: { type: String }
})

const Useradmin = mongoose.model('useradmin', useradminSchema)
module.exports = Useradmin
