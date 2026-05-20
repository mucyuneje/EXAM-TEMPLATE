const Room = require('../models/Room')

exports.getAll = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 })
    res.json({ data: rooms })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.create = async (req, res) => {
  try {
    const room = await Room.create(req.body)
    res.status(201).json({ data: room })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.update = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!room) return res.status(404).json({ message: 'Room not found' })
    res.json({ data: room })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.remove = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id)
    if (!room) return res.status(404).json({ message: 'Room not found' })
    res.json({ message: 'Room deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
