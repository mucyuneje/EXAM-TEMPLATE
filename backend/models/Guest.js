const mongoose = require('mongoose')

const guestSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  idNumber: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true })

module.exports = mongoose.model('Guest', guestSchema)
