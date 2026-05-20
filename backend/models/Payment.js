const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
  paymentNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  amountPaid: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentDate: {
    type: Date,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash', 'Card', 'Mobile Money'],
  },
}, { timestamps: true })

module.exports = mongoose.model('Payment', paymentSchema)
