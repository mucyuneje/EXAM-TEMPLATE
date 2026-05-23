import Car from '../models/Car.js'

export const getAll = async (req, res) => {
  try {
    const items = await Car.find().sort({ createdAt: -1 })
    res.json({ data: items })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

export const create = async (req, res) => {
  try {
    const item = await Car.create(req.body)
    res.status(201).json({ data: item })
  } catch (err) { res.status(400).json({ message: err.message }) }
}

export const update = async (req, res) => {
  try {
    const item = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!item) return res.status(404).json({ message: 'Car not found' })
    res.json({ data: item })
  } catch (err) { res.status(400).json({ message: err.message }) }
}

export const remove = async (req, res) => {
  try {
    const item = await Car.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ message: 'Car not found' })
    res.json({ message: 'Car deleted' })
  } catch (err) { res.status(500).json({ message: err.message }) }
}
