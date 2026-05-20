const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',
    required: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  checkInDate: {
    type: Date,
    required: true,
  },
  checkOutDate: {
    type: Date,
    required: true,
  },
  numberOfNights: {
    type: Number,
    default: 1,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    required: true,
    enum: ['Confirmed', 'Checked-in', 'Checked-out', 'Cancelled'],
    default: 'Confirmed',
  },
}, { timestamps: true })

bookingSchema.pre('save', function (next) {
  if (this.checkInDate && this.checkOutDate) {
    const diff = new Date(this.checkOutDate) - new Date(this.checkInDate)
    this.numberOfNights = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }
  next()
})

module.exports = mongoose.model('Booking', bookingSchema)
