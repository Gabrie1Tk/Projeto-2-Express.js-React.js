const mongoose = require('mongoose')

const showSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  genres:    [String],
  status:    { type: String },
  premiered: { type: String },
  rating:    { type: Number },
  summary:   { type: String },
  image:     { type: String },
  owner:     { type: String, required: true },
}, { timestamps: true })

module.exports = mongoose.model('Show', showSchema)