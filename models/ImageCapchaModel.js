const mongoose = require('mongoose')

const imagecapchaSchema = new mongoose.Schema({
  image: { type: String }
})

const Imagecapcha = mongoose.model('imagecapcha', imagecapchaSchema)
module.exports = Imagecapcha
