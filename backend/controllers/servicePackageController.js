import ServicePackage from '../models/ServicePackage.js'

const pop = [
  { path: 'carId', select: 'plateNumber carType carSize driverName phoneNumber' },
  { path: 'packageId', select: 'packageNumber packageName packageDescription packagePrice' },
]

export const getAll = async (req, res) => {
  try {
    const items = await ServicePackage.find().populate(pop).sort({ createdAt: -1 })
    res.json({ data: items })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

export const getById = async (req, res) => {
  try {
    const item = await ServicePackage.findById(req.params.id).populate(pop)
    if (!item) return res.status(404).json({ message: 'Service package not found' })
    res.json({ data: item })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

export const create = async (req, res) => {
  try {
    const item = await ServicePackage.create(req.body)
    const populated = await ServicePackage.findById(item._id).populate(pop)
    res.status(201).json({ data: populated })
  } catch (err) { res.status(400).json({ message: err.message }) }
}

export const update = async (req, res) => {
  try {
    const item = await ServicePackage.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(pop)
    if (!item) return res.status(404).json({ message: 'Service package not found' })
    res.json({ data: item })
  } catch (err) { res.status(400).json({ message: err.message }) }
}

export const remove = async (req, res) => {
  try {
    const item = await ServicePackage.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ message: 'Service package not found' })
    res.json({ message: 'Service package deleted' })
  } catch (err) { res.status(500).json({ message: err.message }) }
}
