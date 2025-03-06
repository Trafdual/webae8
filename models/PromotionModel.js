const mongoose = require('mongoose')

const PromotionSchema = new mongoose.Schema({
  id: { type: Number },
  category_id: { type: Number },
  slideshow: { type: Number },
  name: { type: String },
  description: { type: String },
  banner: { type: String },
  photo: { type: String },
  start_date: { type: String },
  end_date: { type: String },
  link: { type: String },
  status: { type: Number },
  created: { type: Number },
  updated: { type: Number }
})

const Promotion = mongoose.model('promotion', PromotionSchema)
module.exports = Promotion
