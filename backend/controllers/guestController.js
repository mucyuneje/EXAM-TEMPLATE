const Guest = require('../models/Guest')

exports.getAll = async (req, res) => {
  try {
    const guests = await Guest.find().sort({ createdAt: -1 })
    res.json({ data: guests })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.create = async (req, res) => {
  try {
    const guest = await Guest.create(req.body)
    res.status(201).json({ data: guest })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.update = async (req, res) => {
  try {
    const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!guest) return res.status(404).json({ message: 'Guest not found' })
    res.json({ data: guest })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.remove = async (req, res) => {
  try {
    const guest = await Guest.findByIdAndDelete(req.params.id)
    if (!guest) return res.status(404).json({ message: 'Guest not found' })
    res.json({ message: 'Guest deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
