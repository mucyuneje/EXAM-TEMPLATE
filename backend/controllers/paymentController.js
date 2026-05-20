const Payment = require('../models/Payment')

exports.getAll = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'bookingId',
        populate: { path: 'guestId', select: 'fullName' },
      })
      .sort({ paymentDate: -1 })
    res.json({ data: payments })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.create = async (req, res) => {
  try {
    const payment = await Payment.create(req.body)

    const populated = await Payment.findById(payment._id)
      .populate({
        path: 'bookingId',
        populate: { path: 'guestId', select: 'fullName' },
      })

    res.status(201).json({ data: populated })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.update = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate({
        path: 'bookingId',
        populate: { path: 'guestId', select: 'fullName' },
      })
    if (!payment) return res.status(404).json({ message: 'Payment not found' })
    res.json({ data: payment })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.remove = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id)
    if (!payment) return res.status(404).json({ message: 'Payment not found' })
    res.json({ message: 'Payment deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
