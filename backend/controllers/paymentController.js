import Payment from '../models/Payment.js'

const pop = [{ path: 'recordId', populate: [
  { path: 'carId', select: 'plateNumber carType driverName' },
  { path: 'packageId', select: 'packageNumber packageName packagePrice' },
]}]

export const getAll = async (req, res) => {
  try {
    const items = await Payment.find().populate(pop).sort({ paymentDate: -1 })
    res.json({ data: items })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

export const create = async (req, res) => {
  try {
    const item = await Payment.create(req.body)
    const populated = await Payment.findById(item._id).populate(pop)
    res.status(201).json({ data: populated })
  } catch (err) { res.status(400).json({ message: err.message }) }
}

export const update = async (req, res) => {
  try {
    const item = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(pop)
    if (!item) return res.status(404).json({ message: 'Payment not found' })
    res.json({ data: item })
  } catch (err) { res.status(400).json({ message: err.message }) }
}

export const remove = async (req, res) => {
  try {
    const item = await Payment.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ message: 'Payment not found' })
    res.json({ message: 'Payment deleted' })
  } catch (err) { res.status(500).json({ message: err.message }) }
}
