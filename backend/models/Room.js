const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  roomType: {
    type: String,
    required: true,
    enum: ['Single', 'Double', 'Suite', 'Deluxe'],
  },
  pricePerNight: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'Booked', 'Maintenance'],
    default: 'Available',
  },
}, { timestamps: true })

module.exports = mongoose.model('Room', roomSchema)
