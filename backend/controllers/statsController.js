const Room = require('../models/Room')
const Booking = require('../models/Booking')
const Payment = require('../models/Payment')

exports.availableRooms = async (req, res) => {
  try {
    const count = await Room.countDocuments({ status: 'Available' })
    res.json({ value: count })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.checkedInGuests = async (req, res) => {
  try {
    const count = await Booking.countDocuments({ status: 'Checked-in' })
    res.json({ value: count })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.revenueToday = async (req, res) => {
  try {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)

    const result = await Payment.aggregate([
      { $match: { paymentDate: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ])

    res.json({ value: result[0]?.total || 0 })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.totalBookings = async (req, res) => {
  try {
    const count = await Booking.countDocuments()
    res.json({ value: count })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
