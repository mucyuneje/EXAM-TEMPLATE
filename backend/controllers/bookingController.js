const Booking = require('../models/Booking')
const Room = require('../models/Room')

exports.getAll = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('guestId', 'fullName phone email')
      .populate('roomId', 'roomNumber roomType pricePerNight')
      .sort({ createdAt: -1 })
    res.json({ data: bookings })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.create = async (req, res) => {
  try {
    const booking = await Booking.create(req.body)

    await Room.findByIdAndUpdate(req.body.roomId, { status: 'Booked' })

    const populated = await Booking.findById(booking._id)
      .populate('guestId', 'fullName phone email')
      .populate('roomId', 'roomNumber roomType pricePerNight')

    res.status(201).json({ data: populated })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.update = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('guestId', 'fullName phone email')
      .populate('roomId', 'roomNumber roomType pricePerNight')
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    res.json({ data: booking })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.remove = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id)
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    await Room.findByIdAndUpdate(booking.roomId, { status: 'Available' })

    res.json({ message: 'Booking deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
